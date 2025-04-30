
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface AuthState {
  user: any | null;
  isAuthChecked: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsAuthChecked(true);
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Déconnexion réussie",
            description: "Vous avez été déconnecté avec succès",
          });
        } else if (event === 'SIGNED_IN') {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue sur Fund Road!",
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { user, isAuthChecked };
}
