
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { journeySteps } from "@/data/journeySteps";
import { saveCurrentPath } from "@/utils/navigationUtils";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepNavigationProps {
  stepId: number;
}

export default function StepNavigation({ stepId }: StepNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const handleNavigation = (targetStepId: number) => {
    // Save current path before navigating
    saveCurrentPath(location.pathname + location.search);
    console.log("Navigating from step", stepId, "to step", targetStepId);
    
    // Navigate to the target step
    navigate(`/roadmap/step/${targetStepId}`);
    
    // Show toast notification
    toast({
      title: `Navigation vers l'étape ${targetStepId}`,
      description: "Chargement de la nouvelle étape...",
      duration: 2000
    });
  };

  return (
    <div className="mt-8 flex justify-between items-center">
      {stepId > 1 && (
        <Button 
          variant="outline" 
          onClick={() => handleNavigation(stepId - 1)}
          className="flex items-center"
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
        >
          Étape suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
