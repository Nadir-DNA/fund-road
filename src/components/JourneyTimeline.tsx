
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";
import TimelineStep from "./journey/TimelineStep";
import StepDetail from "./journey/StepDetail";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function JourneyTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedSubStep, setSelectedSubStep] = useState<SubStep | null>(null);
  const navigate = useNavigate();
  
  const {
    localSteps,
    toggleStepCompletion,
    toggleSubStepCompletion,
    isLoading
  } = useJourneyProgress(journeySteps);
  
  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour accéder à votre parcours personnalisé.",
          variant: "destructive",
          duration: 5000,
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

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

  // Show loading state while fetching progress
  if (isLoading) {
    return (
      <div className="py-16 px-4">
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
        <div className="max-w-4xl mx-auto space-y-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex">
              <Skeleton className="h-7 w-7 rounded-full mr-4" />
              <div className="w-full space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
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
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card p-6">
          {selectedStep && (
            <StepDetail step={selectedStep} selectedSubStep={selectedSubStep} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
