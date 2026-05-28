import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import './index.css'

// DEV-only console helpers.
// These should not attach in production.
if (import.meta.env.DEV) {
  import('./dev/installDevConsoleHelpers')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
