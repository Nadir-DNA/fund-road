
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/types/journey";
import { ProgressActions } from "@/types/journeyProgress";
import { calculateProgress } from "@/utils/journeyUtils";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useProgressActions = (
  localSteps: Step[], 
  setLocalSteps: React.Dispatch<React.SetStateAction<Step[]>>,
  setProgress: React.Dispatch<React.SetStateAction<any>>
): ProgressActions => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      try {
        // Update in database
        const { error } = await supabase
          .from('user_journey_progress')
          .upsert({
            user_id: userId,
            step_id: stepId,
            is_completed: !!targetStep.isCompleted
          }, { onConflict: 'user_id,step_id' });
          
        if (error) {
          throw error;
        }
        
        // Update progress state
        setProgress(calculateProgress(updatedSteps));
        
        toast({
          title: targetStep.isCompleted ? "Étape complétée" : "Étape rouverte",
          description: targetStep.title
        });
      } catch (error: any) {
        console.error('Error updating step progress:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre progression.",
          variant: "destructive"
        });
      }
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
      try {
        // Update in database
        const { error } = await supabase
          .from('user_substep_progress')
          .upsert({
            user_id: userId,
            step_id: stepId,
            substep_title: subStepTitle,
            is_completed: !!targetSubStep.isCompleted
          }, { onConflict: 'user_id,step_id,substep_title' });
          
        if (error) {
          throw error;
        }
        
        // Update progress state
        setProgress(calculateProgress(updatedSteps));
      } catch (error: any) {
        console.error('Error updating substep progress:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer votre progression.",
          variant: "destructive"
        });
      }
    }
  };

  return {
    toggleStepCompletion,
    toggleSubStepCompletion
  };
};
