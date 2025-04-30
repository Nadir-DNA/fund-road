
import { useState, useCallback } from "react";
import EmpathyMap from "./EmpathyMap";
import { Button } from "@/components/ui/button";

interface ExpandableEmpathyMapProps {
  stepId: number;
  substepTitle: string;
}

export default function ExpandableEmpathyMap({ stepId, substepTitle }: ExpandableEmpathyMapProps) {
  const [expanded, setExpanded] = useState(false);

  // Stable handler to avoid recreations
  const handleToggle = useCallback(() => {
    setExpanded(prevState => !prevState);
  }, []);

  // Stable close handler that won't change
  const handleClose = useCallback(() => {
    setExpanded(false);
  }, []);

  return (
    <div className="my-4">
      <Button
        className="w-full md:w-auto"
        onClick={handleToggle}
        variant={expanded ? "outline" : "default"}
      >
        {expanded ? "Annuler" : "Ajouter une carte d'empathie"}
      </Button>

      {expanded && (
        <div className="mt-4 p-4 border rounded-md bg-card">
          <EmpathyMap
            stepId={stepId}
            substepTitle={substepTitle}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
