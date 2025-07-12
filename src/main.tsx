import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Debug logging to verify Buffer polyfill is working
console.log('Buffer polyfill check:', {
  BufferAvailable: typeof Buffer !== 'undefined',
  BufferFromAvailable: typeof Buffer.from === 'function',
  windowBufferAvailable: typeof window.Buffer !== 'undefined',
  windowBufferFromAvailable: typeof window.Buffer?.from === 'function'
});

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
