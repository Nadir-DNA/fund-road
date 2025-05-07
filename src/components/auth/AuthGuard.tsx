
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { saveLastPath } from '@/utils/navigationUtils';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  requireAuth: boolean;
}

/**
 * Component to protect routes that require authentication
 */
export default function AuthGuard({ 
  children, 
  fallbackPath = '/auth', 
  requireAuth = true 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
          return;
        }
        
        const isAuth = !!data.session;
        setIsAuthenticated(isAuth);
        
        // If auth required but user not authenticated, redirect to auth page
        if (requireAuth && !isAuth) {
          console.log("User not authenticated, redirecting to auth page");
          // Save current path for redirection after login
          saveLastPath(location.pathname + location.search);
          navigate(fallbackPath);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (requireAuth && !session) {
        saveLastPath(location.pathname + location.search);
        navigate(fallbackPath);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fallbackPath, requireAuth, location]);
  
  // Still checking auth status
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LoadingIndicator size="lg" />
        <p className="mt-4 text-muted-foreground">Vérification de l'authentification...</p>
      </div>
    );
  }
  
  // If auth is not required or user is authenticated, render children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }
  
  // This should not be visible as we redirect in the useEffect
  return null;
}
