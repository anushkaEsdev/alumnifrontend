import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

// Add error boundary for better error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      {children}
    </React.StrictMode>
  )
}

const root = createRoot(rootElement)

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
