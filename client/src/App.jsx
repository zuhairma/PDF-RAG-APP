// Import useState hook from React for managing component state
import { useState } from 'react';
// Import FileUpload component for PDF file uploads
import FileUpload from './components/FileUpload';
// Import ChatWindow component for chat interface
import ChatWindow from './components/ChatWindow';
// Import App-specific CSS styles
import './App.css';

// Main App component that serves as the root of the application
function App() {
  // State to store the PDF namespace (used for vector database queries)
  const [pdfNamespace, setPdfNamespace] = useState('default');
  // State to track whether a PDF has been uploaded
  const [pdfUploaded, setPdfUploaded] = useState(false);

  // Render the main application layout
  return (
    // Container div with 'app' class for styling
    <div className="app">
      {/* Application title heading */}
      <h1>📄 PDF RAG Chat</h1>
      
      {/* FileUpload component with callback to handle successful uploads */}
      <FileUpload 
        // Callback fired when PDF is successfully processed
        onUploadSuccess={(namespace) => {
          // Update namespace state with the returned namespace
          setPdfNamespace(namespace);
          // Set PDF uploaded flag to true
          setPdfUploaded(true);
        }} 
      />
      
      {/* ChatWindow component for interacting with the PDF */}
      <ChatWindow 
        // Pass the current PDF namespace to ChatWindow
        pdfNamespace={pdfNamespace} 
        // Pass upload status to ChatWindow
        pdfUploaded={pdfUploaded}
      />
    </div>
  );
}

// Export App component as default for use in main.jsx
export default App;
