import axios from 'axios';
import { getEmbedding } from './embedder.js';
import { queryVectors, upsertVectors } from './pinecone.js';
import { extractTextFromPDF } from './pdfParser.js';
import { chunkText } from './chunker.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';

export async function processPDF(fileBuffer, filename) {
  const { text } = await extractTextFromPDF(fileBuffer);
  const chunks = chunkText(text);
  
  console.log(`Extracted ${chunks.length} chunks from PDF`);
  
  const vectors = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.text);
    vectors.push({
      id: chunk.id,
      text: chunk.text,
      embedding,
      index: chunk.index
    });
  }
  
  const namespace = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
  await upsertVectors(vectors, namespace);
  
  return {
    numChunks: chunks.length,
    namespace,
    filename
  };
}

export async function chatWithRAG(message, pdfNamespace = 'default') {
  const queryEmbedding = await getEmbedding(message);
  const relevantChunks = await queryVectors(queryEmbedding, 5, pdfNamespace);
  
  if (relevantChunks.length === 0) {
    return await generateChatResponse(message, null);
  }
  
  const context = relevantChunks
    .map(match => match.metadata?.text || '')
    .filter(text => text)
    .join('\n\n');
  
  const prompt = `You are a helpful assistant. Use the following context from the uploaded PDF to answer the question. If the answer is not in the context, say so.

Context:
${context}

Question: ${message}

Answer:`;
  
  return await generateChatResponse(message, prompt);
}

async function generateChatResponse(message, systemPrompt = null) {
  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: message });
  
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: CHAT_MODEL,
      messages,
      stream: false
    });
    
    return {
      response: response.data.message.content,
      source: systemPrompt ? 'pdf' : 'general',
      relevantChunks: systemPrompt ? [] : null
    };
  } catch (error) {
    console.error('Chat error:', error.message);
    throw new Error('Failed to get response from Ollama');
  }
}
