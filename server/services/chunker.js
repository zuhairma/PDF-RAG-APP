// Export function to split text into chunks for vector storage
// Takes text, chunk size (default 500 chars), and overlap (default 50 chars)
export function chunkText(text, chunkSize = 500, overlap = 50) {
  // Initialize empty array to store chunks
  const chunks = [];
  // Split text into sentences using punctuation marks as delimiters
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Initialize empty string to build current chunk
  let currentChunk = '';
  
  // Process each sentence sequentially
  for (const sentence of sentences) {
    // Check if adding sentence would exceed chunk size
    if ((currentChunk + sentence).length <= chunkSize) {
      // Add sentence to current chunk with space
      currentChunk += sentence + ' ';
    } else {
      // Current chunk is full, save it if not empty
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Start new chunk with current sentence
      currentChunk = sentence + ' ';
    }
  }
  
  // Add any remaining text in the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Map chunks to objects with id, text, and index properties
  return chunks.map((chunk, index) => ({
    id: `chunk_${Date.now()}_${index}`,
    text: chunk,
    index
  }));
}
