import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Debug logging to verify Buffer polyfill is working
console.log('Buffer polyfill check:', {
  BufferAvailable: typeof Buffer !== 'undefined',
  BufferFromAvailable: typeof Buffer.from === 'function',
  windowBufferAvailable: typeof window.Buffer !== 'undefined',
  windowBufferFromAvailable: typeof window.Buffer?.from === 'function'
});

// Handle MutationObserver errors from content scripts
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('MutationObserver') && event.message.includes('parameter 1 is not of type \'Node\'')) {
    // Suppress this specific error as it's from external content scripts
    event.preventDefault();
    console.warn('Suppressed MutationObserver error from external content script');
  }
});

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
