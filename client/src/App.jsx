import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [pdfNamespace, setPdfNamespace] = useState('default');
  const [pdfUploaded, setPdfUploaded] = useState(false);

  return (
    <div className="app">
      <h1>📄 PDF RAG Chat</h1>
      
      <FileUpload 
        onUploadSuccess={(namespace) => {
          setPdfNamespace(namespace);
          setPdfUploaded(true);
        }} 
      />
      
      <ChatWindow 
        pdfNamespace={pdfNamespace} 
        pdfUploaded={pdfUploaded}
      />
    </div>
  );
}

export default App;
