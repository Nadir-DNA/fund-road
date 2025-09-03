
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import StepCard from "@/components/journey/StepCard";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { toast } from "@/components/ui/use-toast";

export default function JourneyTimeline() {
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the current step ID from URL
  const match = location.pathname.match(/\/step\/(\d+)/);
  const currentStepId = match ? Number(match[1]) : null;

  const handleStepClick = (stepId: number) => {
    console.log(`Step clicked: ${stepId}`);
    
    // Set a flag in localStorage to indicate resources should be shown
    localStorage.setItem('showResources', 'true');
    
    // Navigate to step detail page
    navigate(`/step/${stepId}`);
  };

  const handleSubStepClick = (stepId: number, substepTitle: string) => {
    console.log(`Substep clicked: ${stepId}/${substepTitle}`);
    
    // Set a flag in localStorage to indicate resources should be shown
    localStorage.setItem('showResources', 'true');
    localStorage.setItem('selectedSubstep', substepTitle);
    
    // Navigate to substep detail page
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
          isSelected={currentStepId === step.id}
          onClick={() => handleStepClick(step.id)}
          onSubStepClick={(substep) => handleSubStepClick(step.id, substep.title)}
        />
      ))}
    </div>
  );
}
