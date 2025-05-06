
export type SubStep = { 
  title: string; 
  description: string; 
  isCompleted?: boolean;
  resources?: Resource[];
  subSubSteps?: SubSubStep[];
};

export type SubSubStep = {
  title: string;
  description: string;
  isCompleted?: boolean;
  resources?: Resource[];
};

export interface Resource {
  id?: string;
  title: string;
  description: string;
  type?: string;
  url?: string;
  componentName?: string;
  status?: 'available' | 'coming-soon' | 'beta';
  courseContent?: string; // Added for course resources
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
