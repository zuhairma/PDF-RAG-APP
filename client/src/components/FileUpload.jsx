// Import useState hook from React for managing component state
import { useState } from 'react';
// Import axios for making HTTP requests to the backend API
import axios from 'axios';
// Import FileUpload-specific CSS styles
import './FileUpload.css';

// FileUpload component for handling PDF file uploads
// Takes onUploadSuccess callback prop to notify parent of successful upload
function FileUpload({ onUploadSuccess }) {
  // State to store the selected file
  const [file, setFile] = useState(null);
  // State to track upload progress/loading
  const [uploading, setUploading] = useState(false);
  // State to store success message
  const [message, setMessage] = useState('');
  // State to store error message
  const [error, setError] = useState('');

  // Function to handle file selection from input
  const handleFileChange = (e) => {
    // Get the first selected file from the input
    const selectedFile = e.target.files[0];
    // Validate that a file was selected and it's a PDF
    if (selectedFile && selectedFile.type === 'application/pdf') {
      // Set the file state with selected file
      setFile(selectedFile);
      // Clear any previous error
      setError('');
    } else {
      // Set error message if file is not a PDF
      setError('Please select a PDF file');
    }
  };

  // Function to handle the file upload process
  const handleUpload = async () => {
    // Return early if no file is selected
    if (!file) return;

    // Set uploading state to true to show loading
    setUploading(true);
    // Clear previous messages
    setMessage('');
    // Clear previous errors
    setError('');

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      // Append the file to FormData with key 'file'
      formData.append('file', file);

      // Send POST request to upload endpoint
      const response = await axios.post('/api/upload', formData, {
        // Set content type for multipart form data
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Set success message from API response
      setMessage(response.data.message);
      // Call parent callback with namespace from response
      onUploadSuccess(response.data.namespace);
    } catch (err) {
      // Set error message from response or default message
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      // Set uploading state to false regardless of success/failure
      setUploading(false);
    }
  };

  // Render the file upload interface
  return (
    // Container div for the upload component
    <div className="upload-container">
      {/* Component title */}
      <h2>Upload PDF</h2>
      
      {/* Upload area containing input and button */}
      <div className="upload-area">
        {/* File input that accepts only PDF files */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file-input"
        />
        
        {/* Display selected file name if a file is chosen */}
        {file && (
          <p className="file-name">Selected: {file.name}</p>
        )}
        
        {/* Upload button */}
        <button
          onClick={handleUpload}
          // Disable button if no file selected or upload in progress
          disabled={!file || uploading}
          className="upload-btn"
        >
          {/* Show different text based on uploading state */}
          {uploading ? 'Processing...' : 'Upload & Embed'}
        </button>
      </div>

      {/* Display success message if present */}
      {message && <p className="success-msg">{message}</p>}
      {/* Display error message if present */}
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

// Export FileUpload component as default
export default FileUpload;
