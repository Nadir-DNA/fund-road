
import { Step, JourneyProgress } from "./journey";
import { Database } from "@/integrations/supabase/types";

// Specific types for Supabase data
export type JourneyProgressRow = Database['public']['Tables']['user_journey_progress']['Row'];
export type SubstepProgressRow = Database['public']['Tables']['user_substep_progress']['Row'];

// Helper types for the journey progress hooks
export type ProgressActions = {
  toggleStepCompletion: (stepId: number) => Promise<void>;
  toggleSubStepCompletion: (stepId: number, subStepTitle: string) => Promise<void>;
};

export type JourneyProgressState = {
  localSteps: Step[];
  progress: JourneyProgress;
  isLoading: boolean;
};
