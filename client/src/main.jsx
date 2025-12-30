// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { SocketProvider } from './context/SocketContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  // ✅ REMOVED StrictMode temporarily to prevent double renders
    <SocketProvider>
      <App />
    </SocketProvider>
)