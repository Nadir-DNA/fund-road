import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Fund Road
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Plateforme de financement pour startups
        </p>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);