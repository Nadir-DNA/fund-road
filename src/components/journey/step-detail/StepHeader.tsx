import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Step, SubStep } from "@/types/journey";
interface StepHeaderProps {
  step: Step;
  selectedSubStep: SubStep | null;
  onClose: () => void;
}
export default function StepHeader({
  step,
  selectedSubStep,
  onClose
}: StepHeaderProps) {
  return <DialogHeader className="mb-4 sm:mb-6">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl sm:text-2xl">{step.title}</DialogTitle>
        
      </div>
      <DialogDescription className="text-sm sm:text-base mt-2">
        {selectedSubStep ? selectedSubStep.description : step.description}
      </DialogDescription>
    </DialogHeader>;
}