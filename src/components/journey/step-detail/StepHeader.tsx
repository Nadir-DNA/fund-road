
// Ce composant n'affiche plus aucune croix. On conserve UNIQUEMENT l'entête pour titre et description.
// Laisser ce composant très simple, ou le supprimer si plus appelé, mais on le laisse pour compatibilité.
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";

interface StepHeaderProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepHeader({
  step,
  selectedSubStep
}: StepHeaderProps) {
  return (
    <DialogHeader className="mb-4 sm:mb-6">
      <DialogTitle className="text-xl sm:text-2xl">{step.title}</DialogTitle>
      <DialogDescription className="text-sm sm:text-base mt-2">
        {selectedSubStep ? selectedSubStep.description : step.description}
      </DialogDescription>
    </DialogHeader>
  );
}
