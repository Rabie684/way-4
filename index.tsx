import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Explicit Service Worker registration for PWA functionality.
// This ensures caching and offline capabilities work as expected,
// now that Firebase Messaging and its internal SW management are removed.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // FIX: Construct an absolute URL for the service worker script using the current origin
    // to resolve the "origin mismatch" error in certain environments.
    const serviceWorkerUrl = new URL('/service-worker.js', window.location.origin).href;
    navigator.serviceWorker.register(serviceWorkerUrl)
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}