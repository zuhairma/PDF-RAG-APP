// Import Express.js to create router for upload endpoints
import express from 'express';
// Import multer for handling multipart/form-data (file uploads)
import multer from 'multer';
// Import the RAG service function that processes PDF files
import { processPDF } from '../services/rag.js';

// Create a new Express router for upload-related endpoints
const router = express.Router();

// Configure multer to store uploaded files in memory (not disk)
// Limit file size to 50MB to prevent large file attacks
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Define POST endpoint for /api/upload to handle PDF file uploads
// Uses 'upload.single' middleware to handle single file upload named 'file'
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was uploaded in the request
    if (!req.file) {
      // Return 400 error if no file was uploaded
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Verify that the uploaded file is a PDF
    if (req.file.mimetype !== 'application/pdf') {
      // Return 400 error if file is not a PDF
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    
    // Process the PDF file using RAG service
    // Pass the file buffer and original filename
    const result = await processPDF(req.file.buffer, req.file.originalname);
    
    // Send success response with message and result data
    res.json({
      success: true,
      message: `PDF processed successfully! Extracted ${result.numChunks} chunks.`,
      ...result
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Upload error:', error);
    // Return 500 error with the error message
    res.status(500).json({ error: error.message });
  }
});

// Export the router for use in main application
export default router;
