// Import React library for building UI components
import React from 'react'
// Import ReactDOM for rendering React components to the DOM
import ReactDOM from 'react-dom/client'
// Import the main App component
import App from './App.jsx'
// Import global CSS styles
import './index.css'

// Create a React root and render the App component
// Get the root DOM element from index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  // Wrap App in StrictMode for development error checking
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
