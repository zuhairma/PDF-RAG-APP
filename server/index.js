// Import Express.js web application framework for building REST APIs
import express from 'express';
// Import CORS middleware to enable cross-origin requests from client
import cors from 'cors';
// Import dotenv to load environment variables from .env file
import dotenv from 'dotenv';
// Import upload routes for handling PDF file uploads
import uploadRoutes from './routes/upload.js';
// Import chat routes for handling chat requests
import chatRoutes from './routes/chat.js';

// Load environment variables from .env file into process.env
dotenv.config();

// Create an Express application instance
const app = express();
// Define the server port, defaulting to 5000 if not specified in environment
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes to allow client to communicate with server
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// Mount upload routes at /api/upload endpoint
app.use('/api/upload', uploadRoutes);
// Mount chat routes at /api/chat endpoint
app.use('/api/chat', chatRoutes);

// Define a health check endpoint that returns server status
app.get('/api/health', (req, res) => {
  // Send JSON response with status and message
  res.json({ status: 'ok', message: 'PDF RAG Server is running' });
});

// Start the HTTP server and listen on the specified port
app.listen(PORT, () => {
  // Log a message indicating the server is running
  console.log(`Server running on http://localhost:${PORT}`);
});
