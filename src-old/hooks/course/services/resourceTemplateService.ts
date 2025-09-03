
import { CourseMaterial } from "../types";
import { supabase } from "@/integrations/supabase/client";

export const createOrUpdateResourceTemplate = async (resourceData: Partial<CourseMaterial>) => {
  const { data, error } = await supabase
    .from('entrepreneur_resources')
    .upsert({
      step_id: resourceData.step_id!,
      substep_title: resourceData.substep_title!,
      substep_index: resourceData.substep_title?.toLowerCase().replace(/\s+/g, '-') || 'default',
      title: resourceData.title!,
      description: resourceData.description,
      resource_type: resourceData.resource_type!,
      file_url: resourceData.file_url,
      is_mandatory: resourceData.is_mandatory || false,
      course_content: resourceData.course_content
    }, { 
      onConflict: 'step_id,substep_title,resource_type' 
    })
    .select();

  if (error) throw error;
  return data;
};
