
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useRoadmapState() {
  const navigate = useNavigate();
  const [lastVisitedStep, setLastVisitedStep] = useState<{ stepId: number, substepTitle: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndGetProgress = async () => {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          if (mounted) {
            toast({
              title: "Connexion requise",
              description: "Vous devez être connecté pour accéder à votre parcours personnalisé.",
              variant: "destructive",
              duration: 5000,
            });
            navigate("/auth");
          }
          return;
        }
        
        setIsAuthenticated(true);
        
        if (session?.session && mounted) {
          try {
            const { data: substepProgress, error: substepError } = await supabase
              .from('user_substep_progress')
              .select('step_id, substep_title, updated_at')
              .eq('user_id', session.session.user.id)
              .order('updated_at', { ascending: false })
              .limit(1);
              
            if (!substepError && substepProgress && substepProgress.length > 0 && mounted) {
              setLastVisitedStep({
                stepId: substepProgress[0].step_id,
                substepTitle: substepProgress[0].substep_title
              });
            } else {
              const { data: stepProgress, error: stepError } = await supabase
                .from('user_journey_progress')
                .select('step_id, updated_at')
                .eq('user_id', session.session.user.id)
                .order('updated_at', { ascending: false })
                .limit(1);
                
              if (!stepError && stepProgress && stepProgress.length > 0 && mounted) {
                setLastVisitedStep({
                  stepId: stepProgress[0].step_id,
                  substepTitle: null
                });
              }
            }
          } catch (error) {
            console.error("Error fetching progress data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthLoading(false);
        }
      }
    };
    
    checkAuthAndGetProgress();
    
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return {
    lastVisitedStep,
    isLoading,
    isNavigating,
    setIsNavigating,
    authLoading,
    isAuthenticated
  };
}
