export function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= chunkSize) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence + ' ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.map((chunk, index) => ({
    id: `chunk_${Date.now()}_${index}`,
    text: chunk,
    index
  }));
}
