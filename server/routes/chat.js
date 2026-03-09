// Import Express.js to create router for chat endpoints
import express from 'express';
// Import the RAG chat function that processes messages with PDF context
import { chatWithRAG } from '../services/rag.js';

// Create a new Express router for chat-related endpoints
const router = express.Router();

// Define POST endpoint for /api/chat to handle user messages
router.post('/', async (req, res) => {
  try {
    // Extract message and namespace from request body
    const { message, namespace } = req.body;
    
    // Validate that message is provided
    if (!message) {
      // Return 400 error if message is missing
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use provided namespace or default to 'default' namespace
    const pdfNamespace = namespace || 'default';
    // Call RAG service to get response based on message and PDF context
    const result = await chatWithRAG(message, pdfNamespace);
    
    // Send the result as JSON response
    res.json(result);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Chat error:', error);
    // Return 500 error with the error message
    res.status(500).json({ error: error.message });
  }
});

// Export the router for use in main application
export default router;
