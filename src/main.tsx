import React from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gradient">
          Fund Road
        </h1>
        <p className="text-xl text-gray-300">
          Plateforme de financement pour startups
        </p>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}