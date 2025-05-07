
import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { journeySteps } from "@/data/journeySteps";
import { saveCurrentPath, saveLastPath } from "@/utils/navigationUtils";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StepNavigationProps {
  stepId: number;
}

export default function StepNavigation({ stepId }: StepNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigation = async (targetStepId: number) => {
    // Éviter les doubles clics
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log(`Navigation demandée de l'étape ${stepId} vers l'étape ${targetStepId}`);
    
    try {
      // Vérifier l'authentification
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      if (!isAuthenticated) {
        // Sauvegarder le chemin cible pour redirection après connexion
        const targetPath = `/roadmap/step/${targetStepId}`;
        saveLastPath(targetPath);
        
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour accéder à cette étape",
          variant: "destructive",
          duration: 5000
        });
        
        // Rediriger vers la page d'authentification
        setTimeout(() => navigate("/auth"), 500);
        return;
      }
      
      // Sauvegarder le chemin actuel avant la navigation
      saveCurrentPath(location.pathname);
      
      // Construire explicitement l'URL cible - sans conserver les paramètres de recherche
      const targetUrl = `/roadmap/step/${targetStepId}`;
      
      // Afficher toast avant navigation
      toast({
        title: `Navigation vers l'étape ${targetStepId}`,
        description: "Chargement de la nouvelle étape...",
        duration: 2000
      });
      
      // Pour éviter les problèmes de navigation, utiliser un petit délai
      // et l'option replace pour remplacer l'entrée actuelle dans l'historique
      setTimeout(() => {
        // Ajouter resetResource dans l'état pour forcer la réinitialisation des ressources
        // Utiliser replace: true pour remplacer l'entrée actuelle dans l'historique
        // et éviter une accumulation d'entrées dans l'historique
        navigate(targetUrl, { 
          replace: true, 
          state: { 
            resetResource: true, 
            fromStep: stepId, 
            toStep: targetStepId,
            timestamp: Date.now() // Ajouter un timestamp pour garantir que l'état est unique
          } 
        });
        console.log(`Navigation effectuée vers: ${targetUrl} avec état de réinitialisation`);
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la navigation:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à l'étape demandée",
        variant: "destructive"
      });
    } finally {
      // Réinitialiser l'état de navigation après un délai
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  return (
    <div className="mt-8 flex justify-between items-center">
      {stepId > 1 && (
        <Button 
          variant="outline" 
          onClick={() => handleNavigation(stepId - 1)}
          className="flex items-center"
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
          className="ml-auto flex items-center"
          disabled={isNavigating}
        >
          Étape suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
