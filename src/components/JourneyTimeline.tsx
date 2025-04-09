
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";
import TimelineStep from "./journey/TimelineStep";
import StepDetail from "./journey/StepDetail";
import { journeySteps } from "@/data/journeySteps";

export default function JourneyTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedSubStep, setSelectedSubStep] = useState<SubStep | null>(null);
  const [localSteps, setLocalSteps] = useState(journeySteps);

  const handleStepClick = (step: Step) => {
    setSelectedStep(step);
    setSelectedSubStep(null);
    setDialogOpen(true);
  };

  const handleSubStepClick = (step: Step, subStep: SubStep) => {
    setSelectedStep(step);
    setSelectedSubStep(subStep);
    setDialogOpen(true);
  };

  const toggleStepCompletion = (stepId: number) => {
    setLocalSteps(prev => 
      prev.map(step => 
        step.id === stepId
          ? { ...step, isCompleted: !step.isCompleted }
          : step
      )
    );
  };

  const toggleSubStepCompletion = (stepId: number, subStepTitle: string) => {
    setLocalSteps(prev => 
      prev.map(step => {
        if (step.id === stepId && step.subSteps) {
          const updatedSubSteps = step.subSteps.map(subStep => 
            subStep.title === subStepTitle
              ? { ...subStep, isCompleted: !subStep.isCompleted }
              : subStep
          );
          return { ...step, subSteps: updatedSubSteps };
        }
        return step;
      })
    );
  };

  return (
    <div className="py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Votre Parcours Entrepreneurial</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suivez ces 10 étapes pour naviguer du concept initial jusqu'à l'obtention de financement,
          avec des ressources dédiées à chaque phase de votre projet.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {localSteps.map((step, index) => (
          <TimelineStep
            key={step.id}
            step={step}
            index={index}
            stepsLength={localSteps.length}
            onStepClick={handleStepClick}
            onSubStepClick={handleSubStepClick}
            onToggleStepCompletion={toggleStepCompletion}
            onToggleSubStepCompletion={toggleSubStepCompletion}
          />
        ))}
      </div>

      {/* Detailed Information Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card">
          {selectedStep && (
            <StepDetail step={selectedStep} selectedSubStep={selectedSubStep} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
