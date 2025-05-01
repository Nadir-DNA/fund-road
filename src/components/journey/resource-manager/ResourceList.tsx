
import { Resource } from "@/types/journey";
import ResourceCard from "./ResourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface ResourceListProps {
  resources: Resource[];
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
  selectedResourceName?: string | null;
}

export default function ResourceList({ resources, stepId, substepTitle, subsubstepTitle, selectedResourceName }: ResourceListProps) {
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [allResources, setAllResources] = useState<Resource[]>(resources);
  
  // Effect to fetch course content directly when component mounts
  useEffect(() => {
    // Start with the existing resources
    setAllResources(resources);
    
    const fetchCourseContent = async () => {
      setIsLoadingCourses(true);
      try {
        console.log(`ResourceList: Fetching courses for step ${stepId} and substep ${substepTitle || 'main'}`);
        
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
          console.error("Error fetching course content:", error);
          return;
        }
        
        if (courses && courses.length > 0) {
          console.log(`Found ${courses.length} courses from Supabase:`, courses);
          
          // Map courses to resources format
          const courseResources: Resource[] = courses.map(course => ({
            id: course.id || `course-${Math.random().toString(36).substring(7)}`,
            title: course.title || "Course Content",
            description: course.description || "Course materials",
            type: "course",
            componentName: "CourseContentDisplay",
            courseContent: course.course_content,
            status: 'available' as const
          }));
          
          // Add course resources to other resources
          setAllResources(prevResources => {
            // Filter out any existing courses to avoid duplicates
            const nonCourseResources = prevResources.filter(r => r.type !== 'course');
            return [...nonCourseResources, ...courseResources];
          });
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    fetchCourseContent();
  }, [stepId, substepTitle, resources]);
  
  if (isLoadingCourses) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingIndicator size="md" />
        <span className="ml-2 text-muted-foreground">Chargement des ressources...</span>
      </div>
    );
  }

  if (!allResources || allResources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-center text-muted-foreground">
              Aucune ressource disponible dans cette catégorie.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {allResources.map((resource, idx) => (
        <ResourceCard
          key={`resource-${idx}-${resource.title}`}
          resource={resource}
          stepId={stepId}
          substepTitle={substepTitle}
          subsubstepTitle={subsubstepTitle}
        />
      ))}
    </div>
  );
}
