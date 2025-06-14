
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { journeySteps } from "@/data/journeySteps";
import { saveCurrentPath } from "@/utils/navigationUtils";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StepNavigationProps {
  stepId: number;
}

export default function StepNavigation({ stepId }: StepNavigationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const handleNavigation = async (targetStepId: number) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    console.log(`Navigation requested from step ${stepId} to step ${targetStepId}`);
    
    try {
      // Check authentication
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      if (!isAuthenticated) {
        const targetPath = `/roadmap/step/${targetStepId}`;
        saveLastPath(targetPath);
        
        toast({
          title: "Authentication requise",
          description: "Veuillez vous connecter pour accéder à cette étape",
          variant: "destructive",
          duration: 5000
        });
        
        setTimeout(() => navigate("/auth"), 500);
        return;
      }
      
      // Save current path before navigation
      saveCurrentPath(window.location.pathname);
      
      const targetUrl = `/roadmap/step/${targetStepId}`;
      
      toast({
        title: `Navigation vers l'étape ${targetStepId}`,
        description: "Chargement de la nouvelle étape...",
        duration: 2000
      });
      
      console.log(`Navigating to: ${targetUrl}`);
      navigate(targetUrl, { replace: false });
      
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à l'étape demandée",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const canNavigatePrevious = stepId > 1;
  const canNavigateNext = stepId < journeySteps.length;
  const currentStep = journeySteps.find(step => step.id === stepId);

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3 border-b border-slate-600">
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Navigation du parcours</h3>
        </div>
      </div>
      
      {/* Navigation content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          {canNavigatePrevious ? (
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleNavigation(stepId - 1)}
              className="flex items-center min-w-[160px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500 shadow-md transition-all duration-200 hover:scale-105"
              disabled={isNavigating}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              {isNavigating ? "Chargement..." : "Étape précédente"}
            </Button>
          ) : (
            <div className="min-w-[160px]" />
          )}
          
          <div className="text-center space-y-2">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 rounded-full border border-slate-600 shadow-inner">
              <span className="text-lg font-bold text-white">
                Étape {stepId} / {journeySteps.length}
              </span>
            </div>
            {currentStep && (
              <p className="text-sm text-slate-300 max-w-xs truncate">
                {currentStep.title}
              </p>
            )}
            {isNavigating && (
              <p className="text-xs text-blue-400 animate-pulse">
                Navigation en cours...
              </p>
            )}
          </div>
          
          {canNavigateNext ? (
            <Button
              size="lg"
              onClick={() => handleNavigation(stepId + 1)}
              className="min-w-[160px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md transition-all duration-200 hover:scale-105"
              disabled={isNavigating}
            >
              {isNavigating ? "Chargement..." : "Étape suivante"}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <div className="min-w-[160px]" />
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-600 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${(stepId / journeySteps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Début</span>
          <span className="font-medium text-slate-300">
            {Math.round((stepId / journeySteps.length) * 100)}% complété
          </span>
          <span>Fin</span>
        </div>
      </div>
    </div>
  );
}

function saveLastPath(path: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastPath', path);
    console.log("Last path saved for redirection:", path);
  }
}
