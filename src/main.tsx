// Temporary compatibility file for Vite build
// This file redirects to Next.js app structure

import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple redirect message for development
const App = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontFamily: 'system-ui',
    backgroundColor: '#0f172a',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1>Migration vers Next.js</h1>
      <p>L'application migre vers Next.js...</p>
      <p>Veuillez utiliser les scripts Next.js pour démarrer l'application.</p>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);