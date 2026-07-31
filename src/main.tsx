import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global API Request timing logger
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  const timingFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = init?.method || 'GET';
    const startTime = performance.now();
    console.log(`[TIMING API START] ${startTime.toFixed(2)}ms - API Request START: [${method}] ${url}`);
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      console.log(`[TIMING API FINISH] ${endTime.toFixed(2)}ms - API Request FINISH: [${method}] ${url} - Status ${response.status} (took ${duration}ms)`);
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      console.log(`[TIMING API ERROR] ${endTime.toFixed(2)}ms - API Request ERROR: [${method}] ${url} (took ${duration}ms)`, error);
      throw error;
    }
  };

  try {
    window.fetch = timingFetch;
  } catch {
    try {
      Object.defineProperty(window, 'fetch', {
        value: timingFetch,
        writable: true,
        configurable: true,
      });
    } catch (err) {
      console.warn("[TIMING] Could not override window.fetch:", err);
    }
  }
}

// Register service worker for caching static assets in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

