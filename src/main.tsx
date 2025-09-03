import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

// Simple React app for development
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Fund Road</h1>
        <p className="text-xl mb-8 text-slate-200">Application en cours de migration vers Next.js</p>
        <p className="text-lg text-slate-300">Preview temporaire avec Vite pendant la migration.</p>
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-2">État de la migration</h2>
          <p className="text-sm text-slate-300">
            ✅ Configuration TypeScript<br/>
            ✅ Styles Tailwind<br/>
            🔄 Migration Next.js en cours
          </p>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);