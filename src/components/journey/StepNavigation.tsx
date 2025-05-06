
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { journeySteps } from "@/data/journeySteps";

interface StepNavigationProps {
  stepId: number;
}

export default function StepNavigation({ stepId }: StepNavigationProps) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 flex justify-between">
      {stepId > 1 && (
        <Button 
          variant="outline" 
          onClick={() => navigate(`/roadmap/step/${stepId - 1}`)}
        >
          Étape précédente
        </Button>
      )}
      
      {stepId < journeySteps.length && (
        <Button
          onClick={() => navigate(`/roadmap/step/${stepId + 1}`)}
          className="ml-auto"
        >
          Étape suivante
        </Button>
      )}
    </div>
  );
}
