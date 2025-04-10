
export type SubStep = { 
  title: string; 
  description: string; 
  isCompleted?: boolean;
};

export type Resource = {
  title: string;
  description: string;
  url?: string; // Adding the url property as optional
};

export type Step = {
  id: number;
  title: string;
  description: string;
  resources: Resource[];
  isActive?: boolean;
  isCompleted?: boolean;
  subSteps?: SubStep[];
  detailedDescription?: string;
};

export interface JourneyProgress {
  completedSteps: number;
  totalSteps: number;
  completedSubsteps: number;
  totalSubsteps: number;
  percentage: number;
}

// Types for the database progress tables
export type UserJourneyProgress = {
  id?: string;
  user_id: string;
  step_id: number;
  is_completed: boolean;
  updated_at?: string;
};

export type UserSubstepProgress = {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  is_completed: boolean;
  updated_at?: string;
};
