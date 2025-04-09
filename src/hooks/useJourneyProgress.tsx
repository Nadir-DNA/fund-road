
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Step, JourneyProgress, UserJourneyProgress, UserSubstepProgress } from "@/types/journey";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useJourneyProgress = (steps: Step[]) => {
  const [localSteps, setLocalSteps] = useState<Step[]>(steps);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<JourneyProgress>({
    completedSteps: 0,
    totalSteps: steps.length,
    completedSubsteps: 0,
    totalSubsteps: 0,
    percentage: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate progress from steps
  const calculateProgress = (steps: Step[]): JourneyProgress => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.isCompleted).length;
    
    let totalSubsteps = 0;
    let completedSubsteps = 0;
    
    steps.forEach(step => {
      if (step.subSteps) {
        totalSubsteps += step.subSteps.length;
        completedSubsteps += step.subSteps.filter(sub => sub.isCompleted).length;
      }
    });
    
    const percentage = Math.round(
      (completedSteps / totalSteps * 0.6 + completedSubsteps / (totalSubsteps || 1) * 0.4) * 100
    );
    
    return {
      completedSteps,
      totalSteps,
      completedSubsteps,
      totalSubsteps,
      percentage
    };
  };

  // Fetch user progress from database
  const fetchUserProgress = async () => {
    setIsLoading(true);
    
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session.session) {
      setIsLoading(false);
      return;
    }
    
    const userId = session.session.user.id;
    
    // Fetch step progress
    const { data: stepProgress, error: stepError } = await supabase
      .from('user_journey_progress')
      .select('*')
      .eq('user_id', userId) as { data: UserJourneyProgress[] | null, error: any };
      
    // Fetch substep progress
    const { data: substepProgress, error: substepError } = await supabase
      .from('user_substep_progress')
      .select('*')
      .eq('user_id', userId) as { data: UserSubstepProgress[] | null, error: any };
    
    if (stepError || substepError) {
      console.error('Error fetching progress:', stepError || substepError);
      setIsLoading(false);
      return;
    }
    
    // Update local steps with database progress
    const updatedSteps = steps.map(step => {
      const stepData = stepProgress?.find(p => p.step_id === step.id);
      const updatedStep = {
        ...step,
        isCompleted: stepData ? stepData.is_completed : step.isCompleted || false,
      };
      
      if (step.subSteps) {
        updatedStep.subSteps = step.subSteps.map(substep => {
          const substepData = substepProgress?.find(
            p => p.step_id === step.id && p.substep_title === substep.title
          );
          
          return {
            ...substep,
            isCompleted: substepData ? substepData.is_completed : substep.isCompleted || false,
          };
        });
      }
      
      return updatedStep;
    });
    
    setLocalSteps(updatedSteps);
    setProgress(calculateProgress(updatedSteps));
    setIsLoading(false);
  };

  // Update step completion status
  const toggleStepCompletion = async (stepId: number) => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour enregistrer votre progression.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    const userId = session.session.user.id;
    const updatedSteps = localSteps.map(step => 
      step.id === stepId
        ? { ...step, isCompleted: !step.isCompleted }
        : step
    );
    
    setLocalSteps(updatedSteps);
    const targetStep = updatedSteps.find(s => s.id === stepId);
    
    if (targetStep) {
      // Update in database
      const progressData: UserJourneyProgress = {
        user_id: userId,
        step_id: stepId,
        is_completed: !!targetStep.isCompleted
      };
      
      const { error } = await supabase
        .from('user_journey_progress')
        .upsert(progressData, { onConflict: 'user_id,step_id' });
        
      if (error) {
        console.error('Error updating step progress:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre progression.",
          variant: "destructive"
        });
        return;
      }
      
      // Update progress state
      setProgress(calculateProgress(updatedSteps));
      
      toast({
        title: targetStep.isCompleted ? "Étape complétée" : "Étape rouverte",
        description: targetStep.title
      });
    }
  };

  // Update substep completion status
  const toggleSubStepCompletion = async (stepId: number, subStepTitle: string) => {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour enregistrer votre progression.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    const userId = session.session.user.id;
    
    const updatedSteps = localSteps.map(step => {
      if (step.id === stepId && step.subSteps) {
        const updatedSubSteps = step.subSteps.map(subStep => 
          subStep.title === subStepTitle
            ? { ...subStep, isCompleted: !subStep.isCompleted }
            : subStep
        );
        return { ...step, subSteps: updatedSubSteps };
      }
      return step;
    });
    
    setLocalSteps(updatedSteps);
    
    const targetStep = updatedSteps.find(s => s.id === stepId);
    const targetSubStep = targetStep?.subSteps?.find(s => s.title === subStepTitle);
    
    if (targetStep && targetSubStep) {
      // Update in database
      const substepProgressData: UserSubstepProgress = {
        user_id: userId,
        step_id: stepId,
        substep_title: subStepTitle,
        is_completed: !!targetSubStep.isCompleted
      };
      
      const { error } = await supabase
        .from('user_substep_progress')
        .upsert(substepProgressData, { onConflict: 'user_id,step_id,substep_title' });
        
      if (error) {
        console.error('Error updating substep progress:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre progression.",
          variant: "destructive"
        });
        return;
      }
      
      // Update progress state
      setProgress(calculateProgress(updatedSteps));
    }
  };

  // Load user progress on component mount
  useEffect(() => {
    fetchUserProgress();
  }, []);

  return {
    localSteps,
    toggleStepCompletion,
    toggleSubStepCompletion,
    progress,
    isLoading
  };
};
