
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Step } from "@/types/journey";
import { JourneyProgressRow, SubstepProgressRow, JourneyProgressState } from "@/types/journeyProgress";
import { updateStepsWithProgress, calculateProgress } from "@/utils/journeyUtils";

export const useJourneyData = (steps: Step[]): JourneyProgressState => {
  const [localSteps, setLocalSteps] = useState<Step[]>(steps);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({
    completedSteps: 0,
    totalSteps: steps.length,
    completedSubsteps: 0,
    totalSubsteps: 0,
    percentage: 0
  });

  // Fetch user progress from database
  const fetchUserProgress = async () => {
    setIsLoading(true);
    
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session.session) {
      setIsLoading(false);
      return;
    }
    
    const userId = session.session.user.id;
    
    try {
      // Fetch step progress
      const { data: stepProgress, error: stepError } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', userId) as { data: JourneyProgressRow[] | null; error: any };
        
      // Fetch substep progress
      const { data: substepProgress, error: substepError } = await supabase
        .from('user_substep_progress')
        .select('*')
        .eq('user_id', userId) as { data: SubstepProgressRow[] | null; error: any };
      
      if (stepError || substepError) {
        console.error('Error fetching progress:', stepError || substepError);
        setIsLoading(false);
        return;
      }
      
      // Update local steps with database progress
      const updatedSteps = updateStepsWithProgress(steps, stepProgress, substepProgress);
      
      setLocalSteps(updatedSteps);
      setProgress(calculateProgress(updatedSteps));
    } catch (error) {
      console.error('Error in fetchUserProgress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user progress on component mount
  useEffect(() => {
    fetchUserProgress();
  }, []);

  return {
    localSteps,
    progress,
    isLoading
  };
};
