
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function useResourceSession() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            
            console.log(`Auth state changed: ${event}`);
            if (currentSession) {
              console.log("Session updated from auth state change");
              setSession(currentSession);
            } else if (event === 'SIGNED_OUT') {
              console.log("User signed out, clearing session");
              setSession(null);
            }
          }
        );
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Session fetch error:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Initial session check:", data?.session ? "Found" : "Not found");
        setSession(data?.session || null);
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        if (mounted) {
          console.error("Error in session initialization:", err);
          setIsLoading(false);
        }
      }
    };
    
    initSession();
    
    return () => {
      mounted = false;
    };
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error fetching session:", error);
        return null;
      }
      
      console.log("Fetched session:", data?.session ? "Found" : "Not found");
      setSession(data?.session || null);
      return data?.session;
    } catch (err) {
      console.error("Error in fetchSession:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requireAuth = useCallback(async () => {
    try {
      // First check if we already have a session
      if (session) {
        console.log("Using existing session");
        return session;
      }
      
      // If not, fetch fresh session
      const freshSession = await fetchSession();
      
      if (!freshSession) {
        console.log("No session found, redirecting to auth page");
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour sauvegarder vos ressources.",
          variant: "destructive"
        });
        navigate("/auth");
        return null;
      }
      
      return freshSession;
    } catch (err) {
      console.error("Error in requireAuth:", err);
      return null;
    }
  }, [fetchSession, navigate, toast, session]);

  return { session, isLoading, fetchSession, requireAuth };
}
