
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function useResourceSession() {
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data?.session || null);
    return data?.session;
  }, []);

  const requireAuth = useCallback(async () => {
    const session = await fetchSession();
    if (!session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour sauvegarder vos ressources.",
        variant: "destructive"
      });
      navigate("/auth");
      throw new Error("Auth required");
    }
    return session;
  }, [fetchSession, navigate, toast]);

  return { session, fetchSession, requireAuth };
}
