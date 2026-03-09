// Import pdf-parse library for extracting text from PDF files
import pdf from 'pdf-parse';

// Export async function to extract text from PDF buffer
// Takes PDF file buffer and returns extracted text with metadata
export async function extractTextFromPDF(buffer) {
  try {
    // Parse the PDF buffer using pdf-parse library
    const data = await pdf(buffer);
    // Return extracted text along with page count and info
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info
    };
  } catch (error) {
    // Log parsing error for debugging
    console.error('PDF parsing error:', error);
    // Throw error if PDF parsing fails
    throw new Error('Failed to parse PDF');
  }
}
