import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple React app for development - using inline styles to avoid CSS processing issues
function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Fund Road
        </h1>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          color: '#e2e8f0'
        }}>
          Application en cours de migration vers Next.js
        </p>
        <p style={{
          fontSize: '1.125rem',
          color: '#cbd5e1',
          marginBottom: '2rem'
        }}>
          Preview temporaire avec Vite pendant la migration.
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '0.5rem',
          maxWidth: '24rem',
          margin: '2rem auto 0',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            État de la migration
          </h2>
          <div style={{
            fontSize: '0.875rem',
            color: '#cbd5e1',
            lineHeight: '1.5'
          }}>
            <div>✅ Configuration TypeScript</div>
            <div>✅ Styles Tailwind</div>
            <div>🔄 Migration Next.js en cours</div>
          </div>
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