
export type SubStep = { 
  title: string; 
  description: string; 
  isCompleted?: boolean;
};

export type Resource = {
  title: string;
  description: string;
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
