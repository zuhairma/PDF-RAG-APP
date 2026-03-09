// Import axios for making HTTP requests to Ollama API
import axios from 'axios';

// Define Ollama API base URL, defaulting to local server on port 11434
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// Define the embedding model to use, defaulting to nomic-embed-text
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

// Export function to get embedding vector for a single text
// Takes text string and returns embedding vector array
export async function getEmbedding(text) {
  try {
    // Send request to Ollama embeddings API
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: EMBED_MODEL,
      prompt: text
    });
    // Return the embedding vector from response
    return response.data.embedding;
  } catch (error) {
    // Log error message for debugging
    console.error('Embedding error:', error.message);
    // Throw error if embedding generation fails
    throw new Error('Failed to get embedding from Ollama');
  }
}

// Export function to get embeddings for multiple texts
// Takes array of text strings and returns array of embedding vectors
export async function getEmbeddings(texts) {
  // Initialize empty array to store embeddings
  const embeddings = [];
  // Process each text to generate embeddings sequentially
  for (const text of texts) {
    // Generate embedding for current text
    const embedding = await getEmbedding(text);
    // Add embedding to results array
    embeddings.push(embedding);
  }
  // Return all generated embeddings
  return embeddings;
}
