
import { useState, useEffect } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import CourseContentDisplay from "../../CourseContentDisplay";

interface OverviewTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  isLoading: boolean;
}

export default function OverviewTab({ 
  stepId,
  substepTitle,
  stepTitle,
  isLoading 
}: OverviewTabProps) {
  const [courseContent, setCourseContent] = useState<string>("");
  const [courseLoading, setCourseLoading] = useState(true);
  
  // Fetch course content from Supabase
  useEffect(() => {
    const fetchCourseContent = async () => {
      setCourseLoading(true);
      try {
        console.log(`Fetching course for step ${stepId} and substep ${substepTitle || 'main'}`);
        
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('resource_type', 'course');
          
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data: courses, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (courses && courses.length > 0) {
          console.log("Found course:", courses[0]);
          setCourseContent(courses[0].course_content || "");
        } else {
          console.log("No course content found");
          setCourseContent("");
        }
      } catch (err) {
        console.error("Error fetching course content:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger le contenu du cours",
          variant: "destructive"
        });
      } finally {
        setCourseLoading(false);
      }
    };
    
    fetchCourseContent();
  }, [stepId, substepTitle]);
  
  if (isLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement du cours...</span>
      </div>
    );
  }
  
  if (!courseContent) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Aucun cours disponible</h3>
        <p className="text-muted-foreground">
          Le contenu du cours pour cette section sera disponible prochainement.
        </p>
      </div>
    );
  }
  
  return (
    <div className="prose prose-invert max-w-none">
      <CourseContentDisplay 
        stepId={stepId}
        substepTitle={substepTitle}
        stepTitle={stepTitle}
        courseContent={courseContent}
      />
    </div>
  );
}
