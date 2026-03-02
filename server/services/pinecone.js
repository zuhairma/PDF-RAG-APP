import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient = null;
let index = null;

export async function initPinecone() {
  if (pineconeClient) return index;
  
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || 'pdf-rag-index';
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set');
  }
  
  pineconeClient = new Pinecone({ apiKey });
  index = pineconeClient.Index(indexName);
  
  console.log('Pinecone initialized successfully');
  return index;
}

export async function upsertVectors(vectors, namespace = 'default') {
  const pineconeIndex = await initPinecone();
  
  const records = vectors.map(vec => ({
    id: vec.id,
    values: vec.embedding,
    metadata: { 
      text: vec.text,
      index: vec.index,
      source: 'pdf'
    }
  }));
  
  await pineconeIndex.namespace(namespace).upsert(records);
  console.log(`Upserted ${records.length} vectors to Pinecone`);
}

export async function queryVectors(queryEmbedding, topK = 5, namespace = 'default') {
  const pineconeIndex = await initPinecone();
  
  const results = await pineconeIndex.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true
  });
  
  return results.matches || [];
}
