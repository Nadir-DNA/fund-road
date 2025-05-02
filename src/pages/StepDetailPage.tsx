
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { useCourseContent } from "@/hooks/useCourseContent";
import StepHeader from "@/components/journey/StepHeader";
import StepTabContent from "@/components/journey/StepTabContent";
import SubstepList from "@/components/journey/SubstepList";
import StepNavigation from "@/components/journey/StepNavigation";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  
  // Parse parameters
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;

  // Get journey progress functions
  const { toggleStepCompletion, toggleSubStepCompletion } = useJourneyProgress(journeySteps);
  
  // Get course content using our custom hook
  const { data: materials, isLoading: courseMaterialsLoading, error: courseError } = useCourseContent(stepId, substepTitle);
  
  // Check if we should show resources tab by default based on localStorage
  const [showResourcesTab, setShowResourcesTab] = useState(false);

  useEffect(() => {
    // Check if we should show resources tab by default based on URL or localStorage
    const showResources = localStorage.getItem('showResources') === 'true';
    
    if (showResources) {
      // Clear the localStorage flag
      localStorage.removeItem('showResources');
      setShowResourcesTab(true);
    }
  }, []);

  if (!step) {
    return (
      <div className="p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <p className="text-red-500 font-medium">Étape non trouvée</p>
          <button 
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => window.history.back()}
          >
            Retour au parcours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <StepHeader 
        step={step}
        stepId={stepId}
        selectedSubStep={selectedSubStep}
        toggleStepCompletion={toggleStepCompletion}
      />
      
      <StepTabContent 
        stepId={stepId}
        substepTitle={substepTitle}
        stepTitle={step.title}
        materials={materials}
        courseMaterialsLoading={courseMaterialsLoading}
        courseError={courseError}
        showResourcesTab={showResourcesTab}
      />
      
      <SubstepList 
        step={step}
        stepId={stepId}
        toggleSubStepCompletion={toggleSubStepCompletion}
      />
      
      <StepNavigation stepId={stepId} />
    </div>
  );
}
