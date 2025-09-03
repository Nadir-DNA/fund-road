
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { saveLastPath } from '@/utils/navigationUtils';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useToast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
  requireAuth: boolean;
}

/**
 * Enhanced AuthGuard with better error handling and state management
 */
export default function AuthGuard({ 
  children, 
  fallbackPath = '/auth', 
  requireAuth = true 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkCount, setCheckCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // First set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;
          
          console.log(`AuthGuard: Auth state changed: ${event}`);
          const isAuth = !!session;
          setIsAuthenticated(isAuth);
          
          // Handle authentication changes while component is mounted
          if (requireAuth && !isAuth && event === 'SIGNED_OUT') {
            console.log("AuthGuard: User signed out, redirecting");
            saveLastPath(location.pathname + location.search);
            navigate(fallbackPath);
          }
        });
        
        // Then get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("AuthGuard: Auth check error:", error);
          setIsAuthenticated(false);
          
          if (requireAuth) {
            console.log("AuthGuard: Error checking auth, redirecting to fallback path");
            saveLastPath(location.pathname + location.search);
            navigate(fallbackPath);
          }
          return;
        }
        
        const isAuth = !!data.session;
        console.log(`AuthGuard: Auth check complete, authenticated: ${isAuth}`);
        setIsAuthenticated(isAuth);
        
        // If auth required but user not authenticated, redirect
        if (requireAuth && !isAuth) {
          console.log("AuthGuard: User not authenticated, redirecting to auth page");
          // Save current path for redirection after login
          saveLastPath(location.pathname + location.search);
          navigate(fallbackPath);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error("AuthGuard: Error checking auth:", err);
        setIsAuthenticated(false);
        
        toast({
          title: "Erreur d'authentification",
          description: "Une erreur est survenue lors de la vérification de votre authentification.",
          variant: "destructive"
        });
        
        if (requireAuth) {
          saveLastPath(location.pathname + location.search);
          navigate(fallbackPath);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, fallbackPath, requireAuth, location, checkCount, toast]);
  
  // Add a method to retry auth check if needed
  const retryAuthCheck = () => {
    setCheckCount(prev => prev + 1);
  };
  
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
