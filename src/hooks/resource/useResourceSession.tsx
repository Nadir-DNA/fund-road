
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function useResourceSession() {
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check:", data?.session ? "Found" : "Not found");
      setSession(data?.session || null);
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
    const { data } = await supabase.auth.getSession();
    console.log("Fetched session:", data?.session ? "Found" : "Not found");
    setSession(data?.session || null);
    return data?.session;
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
      throw new Error("Auth required");
    }
    
    return freshSession;
  }, [fetchSession, navigate, toast, session]);

  return { session, fetchSession, requireAuth };
}
