
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { clearLastPath } from "@/utils/navigationUtils";
import RoadmapHeader from "@/components/roadmap/RoadmapHeader";
import { useRoadmapState } from "@/components/roadmap/useRoadmapState";

export default function Roadmap() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  const {
    lastVisitedStep,
    isLoading,
    isNavigating,
    setIsNavigating,
    authLoading,
    isAuthenticated
  } = useRoadmapState();
  
  const targetStepId = searchParams.get('step') ? parseInt(searchParams.get('step') || '1') : null;
  const targetSubstep = searchParams.get('substep');
  
  // Scroll to target step when parameters or loading state changes
  useEffect(() => {
    if (!stepsLoading && targetStepId && targetSubstep) {
      const timer = setTimeout(() => {
        const stepElement = document.querySelector(`[data-step-id="${targetStepId}"]`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          setTimeout(() => {
            (stepElement as HTMLElement).click();
          }, 500);
        }
        
        clearLastPath();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [stepsLoading, targetStepId, targetSubstep]);
  
  const findIncompleteStep = () => {
    if (lastVisitedStep) return lastVisitedStep;
    
    for (const step of localSteps) {
      if (!step.isCompleted) {
        if (step.subSteps) {
          for (const substep of step.subSteps) {
            if (!substep.isCompleted) {
              return { stepId: step.id, substepTitle: substep.title };
            }
          }
        }
        return { stepId: step.id, substepTitle: null };
      }
    }
    
    return { stepId: localSteps[0].id, substepTitle: null };
  };
  
  const handleContinueJourney = () => {
    setIsNavigating(true);
    const nextStep = findIncompleteStep();
    
    if (!nextStep) {
      setIsNavigating(false);
      return;
    }
    
    const stepElement = document.querySelector(`[data-step-id="${nextStep.stepId}"]`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        (stepElement as HTMLElement).click();
        setIsNavigating(false);
      }, 500);
    } else {
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <section className="container mx-auto px-4 py-8">
          <RoadmapHeader
            isAuthenticated={isAuthenticated}
            lastVisitedStep={lastVisitedStep}
            isLoading={isLoading}
            authLoading={authLoading}
            isNavigating={isNavigating}
            onContinueJourney={handleContinueJourney}
            t={t}
          />
          
          <JourneyProgressIndicator />
          
          {stepsLoading ? (
            <div className="w-full flex justify-center py-12">
              <LoadingIndicator size="lg" />
            </div>
          ) : (
            <JourneyTimeline />
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
