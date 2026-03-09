// Import axios for making HTTP requests to Ollama API
import axios from 'axios';
// Import embedding function to convert text to vector embeddings
import { getEmbedding } from './embedder.js';
// Import Pinecone functions for vector storage operations
import { queryVectors, upsertVectors } from './pinecone.js';
// Import PDF text extraction function
import { extractTextFromPDF } from './pdfParser.js';
// Import text chunking function to split text into smaller pieces
import { chunkText } from './chunker.js';

// Define Ollama API base URL, defaulting to local server on port 11434
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// Define the chat model to use, defaulting to llama3.2
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';

// Export function to process uploaded PDF files
// Takes file buffer and filename as parameters
export async function processPDF(fileBuffer, filename) {
  // Extract text content from the PDF file
  const { text } = await extractTextFromPDF(fileBuffer);
  // Split the extracted text into manageable chunks
  const chunks = chunkText(text);
  
  // Log the number of chunks extracted for debugging
  console.log(`Extracted ${chunks.length} chunks from PDF`);
  
  // Initialize array to store vector embeddings
  const vectors = [];
  // Process each chunk to generate embeddings
  for (const chunk of chunks) {
    // Generate embedding vector for the chunk text
    const embedding = await getEmbedding(chunk.text);
    // Push the chunk with its embedding to vectors array
    vectors.push({
      id: chunk.id,
      text: chunk.text,
      embedding,
      index: chunk.index
    });
  }
  
  // Create a namespace from filename by removing .pdf extension
  // and replacing non-alphanumeric characters with underscores
  const namespace = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
  // Store the vectors in Pinecone under the generated namespace
  await upsertVectors(vectors, namespace);
  
  // Return processing results
  return {
    numChunks: chunks.length,
    namespace,
    filename
  };
}

// Export function to handle chat messages with RAG functionality
// Takes user message and optional PDF namespace
export async function chatWithRAG(message, pdfNamespace = 'default') {
  // Generate embedding vector for the user's query
  const queryEmbedding = await getEmbedding(message);
  // Query Pinecone for the top 5 most relevant chunks from the PDF
  const relevantChunks = await queryVectors(queryEmbedding, 5, pdfNamespace);
  
  // If no relevant chunks found, generate general response without context
  if (relevantChunks.length === 0) {
    return await generateChatResponse(message, null);
  }
  
  // Extract text from relevant chunks and join them as context
  const context = relevantChunks
    .map(match => match.metadata?.text || '')
    .filter(text => text)
    .join('\n\n');
  
  // Construct a prompt that includes the PDF context
  // Instructs the AI to use context and answer based on it
  const prompt = `You are a helpful assistant. Use the following context from the uploaded PDF to answer the question. If the answer is not in the context, say so.

Context:
${context}

Question: ${message}

Answer:`;
  
  // Generate response using the constructed prompt
  return await generateChatResponse(message, prompt);
}

// Internal function to generate chat response using Ollama API
// Takes user message and optional system prompt with context
async function generateChatResponse(message, systemPrompt = null) {
  // Initialize messages array for API request
  const messages = [];
  
  // If system prompt is provided (with PDF context), add it to messages
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  // Add the user's message to the messages array
  messages.push({ role: 'user', content: message });
  
  try {
    // Send request to Ollama chat API
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages,
      stream: false
    });
    
    // Return the AI's response with metadata
    return {
      response: response.data.message.content,
      source: systemPrompt ? 'pdf' : 'general',
      relevantChunks: systemPrompt ? [] : null
    };
  } catch (error) {
    // Log error message for debugging
    console.error('Chat error:', error.message);
    // Throw error if Ollama request fails
    throw new Error('Failed to get response from Ollama');
  }
}
