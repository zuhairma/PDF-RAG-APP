import express from 'express';
import { chatWithRAG } from '../services/rag.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, namespace } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const pdfNamespace = namespace || 'default';
    const result = await chatWithRAG(message, pdfNamespace);
    
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
