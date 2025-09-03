import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold mb-4 text-gradient">
          Fund Road
        </h1>
        <p className="text-xl mb-6 text-muted-foreground">
          Plateforme de financement pour startups
        </p>
        <div className="glass-card p-6 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            ✅ Vite configuré<br/>
            ✅ React 18<br/>
            ✅ Design System actif
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