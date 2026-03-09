// Import Pinecone client library for vector database operations
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize client and index as null (lazy initialization)
let pineconeClient = null;
let index = null;

// Export function to initialize Pinecone client and index
// Returns the Pinecone index for vector operations
export async function initPinecone() {
  // Return cached index if already initialized
  if (pineconeClient) return index;
  
  // Get API key from environment variables
  const apiKey = process.env.PINECONE_API_KEY;
  // Get index name from environment, default to 'pdf-rag-index'
  const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-rag-index';
  
  // Check if API key is configured
  if (!apiKey) {
    // Throw error if API key is missing
    throw new Error('PINECONE_API_KEY is not set');
  }
  
  // Create new Pinecone client with API key
  pineconeClient = new Pinecone({ apiKey });
  // Get the specified index from Pinecone
  index = pineconeClient.Index(indexName);
  
  // Log successful initialization
  console.log('Pinecone initialized successfully');
  // Return the index for use in other functions
  return index;
}

// Export function to upsert (insert or update) vectors in Pinecone
// Takes array of vectors and optional namespace parameter
export async function upsertVectors(vectors, namespace = 'default') {
  // Ensure Pinecone is initialized before operations
  const pineconeIndex = await initPinecone();
  
  // Transform vectors into Pinecone record format
  const records = vectors.map(vec => ({
    id: vec.id,
    values: vec.embedding,
    metadata: { 
      text: vec.text,
      index: vec.index,
      source: 'pdf'
    }
  }));
  
  // Upsert records into the specified namespace
  await pineconeIndex.namespace(namespace).upsert(records);
  // Log the number of vectors upserted
  console.log(`Upserted ${records.length} vectors to Pinecone`);
}

// Export function to query vectors from Pinecone
// Takes query embedding, number of results (topK), and namespace
export async function queryVectors(queryEmbedding, topK = 5, namespace = 'default') {
  // Ensure Pinecone is initialized before operations
  const pineconeIndex = await initPinecone();
  
  // Query the namespace for similar vectors
  const results = await pineconeIndex.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true
  });
  
  // Return the matching vectors (results)
  return results.matches || [];
}
