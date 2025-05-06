
import { SubStep } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SubstepButtonProps {
  substep: SubStep;
  onClick: () => void;
}

export default function SubstepButton({ substep, onClick }: SubstepButtonProps) {
  return (
    <Button
      variant="outline"
      className="justify-start h-auto py-2 text-left"
      onClick={onClick}
    >
      <div className="flex items-center w-full">
        {substep.isCompleted && (
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mr-2" />
        )}
        <div className="truncate">{substep.title}</div>
      </div>
    </Button>
  );
}
