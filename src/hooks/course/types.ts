
import { Database } from "@/integrations/supabase/types";

export interface CourseMaterial {
  id: string;
  step_id: number;
  substep_title: string | null;
  subsubstep_title: string | null;
  title: string;
  description: string;
  resource_type: string;
  file_url: string | null;
  is_mandatory: boolean;
  course_content: string | null;
  component_name: string | null;
}

export type UserProgress = {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string | null;
  is_completed: boolean;
};

export type UserResource = {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  resource_type: string;
  content: any;
};
