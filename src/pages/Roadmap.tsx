
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function Roadmap() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lastVisitedStep, setLastVisitedStep] = useState<{ stepId: number, substepTitle: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  
  // Check for authentication and get the user's last visited step
  useEffect(() => {
    const checkAuthAndGetProgress = async () => {
      setIsLoading(true);
      
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          toast({
            title: "Connexion requise",
            description: "Vous devez être connecté pour accéder à votre parcours personnalisé.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        
        // Find the most recently updated substep progress
        const { data: substepProgress, error: substepError } = await supabase
          .from('user_substep_progress')
          .select('step_id, substep_title, updated_at')
          .eq('user_id', session.session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (!substepError && substepProgress && substepProgress.length > 0) {
          setLastVisitedStep({
            stepId: substepProgress[0].step_id,
            substepTitle: substepProgress[0].substep_title
          });
        } else {
          // If no substep found, check for step progress
          const { data: stepProgress, error: stepError } = await supabase
            .from('user_journey_progress')
            .select('step_id, updated_at')
            .eq('user_id', session.session.user.id)
            .order('updated_at', { ascending: false })
            .limit(1);
            
          if (!stepError && stepProgress && stepProgress.length > 0) {
            setLastVisitedStep({
              stepId: stepProgress[0].step_id,
              substepTitle: null
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndGetProgress();
  }, [navigate]);
  
  // Find the next incomplete step if no last visited step
  const findIncompleteStep = () => {
    if (lastVisitedStep) return lastVisitedStep;
    
    for (const step of localSteps) {
      if (!step.isCompleted) {
        // Check for incomplete substeps
        if (step.subSteps) {
          for (const substep of step.subSteps) {
            if (!substep.isCompleted) {
              return { stepId: step.id, substepTitle: substep.title };
            }
          }
        }
        // If no incomplete substep found, return the step
        return { stepId: step.id, substepTitle: null };
      }
    }
    
    // If all steps are complete, return the first step
    return { stepId: localSteps[0].id, substepTitle: null };
  };
  
  const handleContinueJourney = () => {
    const nextStep = findIncompleteStep();
    
    if (!nextStep) return;
    
    // This will open the step detail dialog in the JourneyTimeline component
    const stepElement = document.querySelector(`[data-step-id="${nextStep.stepId}"]`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        (stepElement as HTMLElement).click();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <section className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Parcours Entrepreneurial
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Suivez ces étapes pour transformer votre idée en entreprise, avec des ressources dédiées à chaque phase.
            </p>
            
            {!isLoading && lastVisitedStep ? (
              <Button 
                onClick={handleContinueJourney}
                className="mt-6 bg-gradient-to-r from-primary to-accent text-white px-8"
                disabled={stepsLoading}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {t("roadmap.continueJourney") || "Reprendre mon parcours"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : isLoading ? (
              <Skeleton className="h-11 w-60 mx-auto mt-6" />
            ) : null}
          </div>
          
          <JourneyProgressIndicator />
          <JourneyTimeline />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
