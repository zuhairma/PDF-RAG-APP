import { useState } from 'react';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow({ pdfNamespace, pdfUploaded }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true }]);

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage,
        namespace: pdfUploaded ? pdfNamespace : 'default'
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: response.data.response,
          source: response.data.source
        };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Error: ' + (err.response?.data?.error || err.message),
          source: 'error'
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat</h2>
        {!pdfUploaded && (
          <span className="warning-badge">Upload a PDF to enable RAG</span>
        )}
        {pdfUploaded && (
          <span className="success-badge">RAG Enabled</span>
        )}
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <p className="placeholder">Ask me anything about your PDF!</p>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.source && msg.source !== 'error' && (
                <span className={`source-badge ${msg.source}`}>
                  {msg.source === 'pdf' ? '📄 From PDF' : '🧠 General'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          rows={2}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
