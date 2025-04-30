
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import StepCard from "@/components/journey/StepCard";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function JourneyTimeline() {
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const handleStepClick = (stepId: number) => {
    setSelectedStep(stepId);
    navigate(`/step/${stepId}`);
  };

  const handleSubStepClick = (stepId: number, substepTitle: string) => {
    navigate(`/step/${stepId}/${encodeURIComponent(substepTitle)}`);
  };

  if (stepsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      {localSteps.map((step) => (
        <StepCard
          key={step.id}
          step={step}
          isSelected={selectedStep === step.id}
          onClick={() => handleStepClick(step.id)}
          onSubStepClick={(substep) => handleSubStepClick(step.id, substep.title)}
        />
      ))}
    </div>
  );
}
