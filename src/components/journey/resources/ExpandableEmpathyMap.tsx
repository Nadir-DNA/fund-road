
import { useState } from "react";
import EmpathyMap from "./EmpathyMap";
import { Button } from "@/components/ui/button";

interface ExpandableEmpathyMapProps {
  stepId: number;
  substepTitle: string;
}

export default function ExpandableEmpathyMap({ stepId, substepTitle }: ExpandableEmpathyMapProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-4">
      <Button
        className="w-full md:w-auto"
        onClick={() => setExpanded(prev => !prev)}
        variant={expanded ? "outline" : "default"}
      >
        {expanded ? "Annuler" : "Ajouter une carte d'empathie"}
      </Button>

      {expanded && (
        <div className="mt-4 p-4 border rounded-md bg-card">
          <EmpathyMap
            stepId={stepId}
            substepTitle={substepTitle}
            onClose={() => setExpanded(false)}
          />
        </div>
      )}
    </div>
  );
}
