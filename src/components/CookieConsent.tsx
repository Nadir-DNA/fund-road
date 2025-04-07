
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Show the banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-50">
      <div className="glass-card bg-black/60 border border-white/10 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/10 p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-white">
            Nous utilisons des cookies pour vous offrir la meilleure expérience sur notre plateforme. Ils nous aident à analyser le trafic et à personnaliser votre parcours entrepreneurial.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-initial border-white/10 hover:bg-white/10"
            onClick={handleDecline}
          >
            Refuser
          </Button>
          <Button 
            variant="default" 
            className="flex-1 md:flex-initial bg-white text-black hover:bg-white/90"
            onClick={handleAccept}
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
