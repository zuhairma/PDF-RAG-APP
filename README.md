# PDF RAG Chat Application

A Retrieval-Augmented Generation (RAG) application that allows you to upload PDF files and ask questions about their content using local Ollama models and Pinecone vector database.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ReactJS       │────▶│   Express       │────▶│   Pinecone      │
│   Frontend      │     │   Backend       │     │   Vector DB     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Ollama        │
                        │   (Local AI)    │
                        └─────────────────┘
```

## Features

- **PDF Upload**: Upload PDF files and extract text
- **Text Chunking**: Split PDF content into manageable chunks
- **Vector Embedding**: Generate embeddings using Ollama (nomic-embed-text)
- **Vector Storage**: Store embeddings in Pinecone
- **RAG Chat**: Ask questions and get answers from your PDF content
- **Fallback to General Knowledge**: If answer isn't in PDF, uses Ollama's general knowledge

## Prerequisites

1. **Ollama** - Download from [ollama.ai](https://ollama.ai)
2. **Pinecone Account** - Sign up at [pinecone.io](https://pinecone.io)

## Setup

### 1. Pull Required Ollama Models

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

### 2. Create Pinecone Index

1. Go to [pinecone.io](https://pinecone.io) and sign up
2. Create a new index:
   - **Name:** `pdf-rag-index`
   - **Dimension:** `768`
   - **Metric:** `cosine`
3. Get your API key from the dashboard

### 3. Configure Environment

```bash
cd pdf-rag-app/server
cp .env.example .env
# Edit .env with your Pinecone API key
```

### 4. Install Dependencies

**Backend:**
```bash
cd pdf-rag-app/server
npm install
```

**Frontend:**
```bash
cd pdf-rag-app/client
npm install
```

## Running the Application

### Start Backend

```bash
cd pdf-rag-app/server
npm run dev
```

### Start Frontend

```bash
cd pdf-rag-app/client
npm run dev
```

### Open Browser

Navigate to: **http://localhost:3000**

## Usage

1. **Upload a PDF**: Click "Choose File" and select a PDF document
2. **Wait for Processing**: The app will extract text, chunk it, and embed it into Pinecone
3. **Ask Questions**: Type questions about the PDF content in the chat
4. **View Sources**: Answers show whether they came from the PDF or general knowledge

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `PINECONE_API_KEY` | Your Pinecone API key | Required |
| `PINECONE_INDEX_NAME` | Name of Pinecone index | `pdf-rag-index` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_EMBED_MODEL` | Embedding model | `nomic-embed-text` |
| `OLLAMA_CHAT_MODEL` | Chat model | `llama3.2` |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/upload` | POST | Upload PDF file |
| `/api/chat` | POST | Send chat message |

## Project Structure

```
pdf-rag-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── FileUpload.jsx
│   │   │   └── ChatWindow.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                    # Express backend
│   ├── routes/
│   │   ├── upload.js         # PDF upload endpoint
│   │   └── chat.js           # Chat endpoint
│   ├── services/
│   │   ├── pdfParser.js      # PDF text extraction
│   │   ├── chunker.js        # Text chunking
│   │   ├── embedder.js       # Ollama embeddings
│   │   ├── pinecone.js       # Pinecone operations
│   │   └── rag.js            # RAG logic
│   ├── index.js
│   └── package.json
└── .env                       # Environment variables
```

## Troubleshooting

### Port Already in Use

If you get `EADDRINUSE` error, change the port in:
- `server/.env` - Change `PORT=5000` to another value
- `client/vite.config.js` - Update the proxy target

### Ollama Not Running

Make sure Ollama is running:
```bash
ollama serve
```

### Pinecone Connection Error

Verify your API key is correct in the `.env` file.

