import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        console.log('[SW] Registered notification action worker.');
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}

const action = new URLSearchParams(window.location.search).get('reminderAction');
if (action) {
  const labels: Record<string, string> = {
    take: 'Dose marked as taken.',
    snooze: 'Reminder snoozed for 15 minutes.',
    skip: 'Dose marked as skipped.'
  };
  alert(labels[action] || 'Reminder action captured.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
