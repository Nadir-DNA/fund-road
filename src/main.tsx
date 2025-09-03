import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '600px',
        padding: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Fund Road
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '1rem' }}>
          Plateforme de financement pour startups
        </p>
        <p style={{ fontSize: '1rem', opacity: 0.7 }}>
          Application en cours de migration vers Next.js
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            ✅ Vite configuré<br/>
            ✅ React 18<br/>
            🔄 Migration Next.js en cours
          </p>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}