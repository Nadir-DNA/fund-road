import React from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
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
        fontWeight: 'bold'
      }}>
        Fund Road
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
        Plateforme de financement pour startups
      </p>
    </div>
  </div>
)