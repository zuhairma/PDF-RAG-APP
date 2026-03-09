// Import useState hook from React for managing component state
import { useState } from 'react';
// Import axios for making HTTP requests to the backend API
import axios from 'axios';
// Import ChatWindow-specific CSS styles
import './ChatWindow.css';

// ChatWindow component for handling chat interactions
// Takes pdfNamespace and pdfUploaded as props from parent component
function ChatWindow({ pdfNamespace, pdfUploaded }) {
  // State to store chat messages array
  const [messages, setMessages] = useState([]);
  // State to store the current input text
  const [input, setInput] = useState('');
  // State to track loading status during API calls
  const [loading, setLoading] = useState(false);

  // Function to handle sending a message to the API
  const handleSend = async () => {
    // Return early if input is empty or already loading
    if (!input.trim() || loading) return;

    // Get the trimmed user message
    const userMessage = input.trim();
    // Clear the input field
    setInput('');
    // Set loading to true to show loading state
    setLoading(true);

    // Add user's message to the messages array
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    // Add a placeholder assistant message with loading state
    setMessages(prev => [...prev, { role: 'assistant', content: '', loading: true }]);

    try {
      // Send POST request to chat API endpoint
      const response = await axios.post('/api/chat', {
        message: userMessage,
        // Use PDF namespace if uploaded, otherwise use 'default'
        namespace: pdfUploaded ? pdfNamespace : 'default'
      });

      // Update the last message (assistant response) with actual response
      setMessages(prev => {
        // Create a copy of the messages array
        const updated = [...prev];
        // Replace the loading placeholder with actual response
        updated[updated.length - 1] = {
          role: 'assistant',
          content: response.data.response,
          source: response.data.source
        };
        return updated;
      });
    } catch (err) {
      // Handle errors by showing error message in chat
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
      // Set loading back to false regardless of success/failure
      setLoading(false);
    }
  };

  // Function to handle keyboard input (Enter key to send)
  const handleKeyPress = (e) => {
    // Check if Enter was pressed without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default behavior (new line)
      e.preventDefault();
      // Call the send handler
      handleSend();
    }
  };

  // Render the chat interface
  return (
    // Container div for the chat component
    <div className="chat-container">
      {/* Header section with title and status badges */}
      <div className="chat-header">
        <h2>💬 Chat</h2>
        {/* Show warning badge if no PDF uploaded */}
        {!pdfUploaded && (
          <span className="warning-badge">Upload a PDF to enable RAG</span>
        )}
        {/* Show success badge if PDF is uploaded */}
        {pdfUploaded && (
          <span className="success-badge">RAG Enabled</span>
        )}
      </div>

      {/* Messages display area */}
      <div className="messages">
        {/* Show placeholder text when no messages exist */}
        {messages.length === 0 && (
          <p className="placeholder">Ask me anything about your PDF!</p>
        )}
        
        {/* Render each message in the messages array */}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">
              {/* Display the message content */}
              {msg.content}
              {/* Show source badge if source is available and not an error */}
              {msg.source && msg.source !== 'error' && (
                <span className={`source-badge ${msg.source}`}>
                  {msg.source === 'pdf' ? '📄 From PDF' : '🧠 General'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area for typing messages */}
      <div className="input-area">
        {/* Textarea for user input */}
        <textarea
          // Bind input value to state
          value={input}
          // Update state on input change
          onChange={(e) => setInput(e.target.value)}
          // Handle Enter key press
          onKeyPress={handleKeyPress}
          // Placeholder text when empty
          placeholder="Type your question..."
          // Set number of visible rows
          rows={2}
        />
        {/* Send button */}
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {/* Show different text based on loading state */}
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// Export ChatWindow component as default
export default ChatWindow;
