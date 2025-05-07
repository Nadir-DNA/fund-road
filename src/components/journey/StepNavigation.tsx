
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { journeySteps } from "@/data/journeySteps";
import { saveCurrentPath } from "@/utils/navigationUtils";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StepNavigationProps {
  stepId: number;
}

export default function StepNavigation({ stepId }: StepNavigationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigation = async (targetStepId: number) => {
    // Prevent double clicks
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log(`Navigation requested from step ${stepId} to step ${targetStepId}`);
    
    try {
      // Check authentication
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      if (!isAuthenticated) {
        // Save target path for redirect after login
        const targetPath = `/roadmap/step/${targetStepId}`;
        saveLastPath(targetPath);
        
        toast({
          title: "Authentication requise",
          description: "Veuillez vous connecter pour accéder à cette étape",
          variant: "destructive",
          duration: 5000
        });
        
        // Redirect to auth page
        setTimeout(() => navigate("/auth"), 500);
        return;
      }
      
      // Save current path before navigation
      saveCurrentPath(window.location.pathname);
      
      // Build the target URL
      const targetUrl = `/roadmap/step/${targetStepId}`;
      
      // Show toast before navigation
      toast({
        title: `Navigation vers l'étape ${targetStepId}`,
        description: "Chargement de la nouvelle étape...",
        duration: 2000
      });
      
      console.log(`Navigating to: ${targetUrl} using direct URL change`);
      
      // Use direct URL change to force a complete page reload and state reset
      // This is more reliable than React Router's navigate for complex state resets
      window.location.href = targetUrl;
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à l'étape demandée",
        variant: "destructive"
      });
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      {stepId > 1 && (
        <Button 
          variant="outline" 
          onClick={() => handleNavigation(stepId - 1)}
          className="flex items-center w-36"
          disabled={isNavigating}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Étape précédente
        </Button>
      )}
      
      <div className="text-sm text-muted-foreground mx-auto">
        Étape {stepId}/{journeySteps.length}
      </div>
      
      {stepId < journeySteps.length && (
        <Button
          onClick={() => handleNavigation(stepId + 1)}
          className="ml-auto flex items-center w-36"
          disabled={isNavigating}
        >
          Étape suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

// Helper function to save last path
function saveLastPath(path: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastPath', path);
    console.log("Last path saved for redirection:", path);
  }
}
