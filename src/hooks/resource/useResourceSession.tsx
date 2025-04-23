
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
    const initSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session fetch error:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Initial session check:", data?.session ? "Found" : "Not found");
        setSession(data?.session || null);
      } catch (err) {
        console.error("Error in session initialization:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth state changed: ${event}`);
        setSession(currentSession);
      }
    );
    
    return () => subscription.unsubscribe();
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
  }, [fetchSession, navigate, toast, session]);

  return { session, isLoading, fetchSession, requireAuth };
}
