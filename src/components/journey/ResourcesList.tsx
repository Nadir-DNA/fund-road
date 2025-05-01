
import { useCourseContent } from "@/hooks/useCourseContent";
import CourseContentDisplay from "./CourseContentDisplay";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface ResourcesListProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string; // Make stepTitle optional
}

export default function ResourcesList({ stepId, substepTitle, stepTitle }: ResourcesListProps) {
  const { data: resources, isLoading, error } = useCourseContent(stepId, substepTitle);

  console.log(`ResourcesList - Rendering with stepId: ${stepId}, substepTitle: ${substepTitle || 'main'}`);
  console.log(`ResourcesList - Resources available: ${resources?.length || 0}`);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucune ressource disponible pour cette étape.</p>
        <pre className="mt-4 text-sm text-left p-4 bg-gray-50 rounded overflow-auto">
          Debug Info: {JSON.stringify({ 
            stepId, 
            substepTitle, 
            queryDetails: { 
              table: 'entrepreneur_resources',
              filters: {
                step_id: stepId,
                resource_type: 'course',
                substep_title: substepTitle || 'IS NULL'
              }
            }
          }, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {resources.map((resource) => (
        <div key={resource.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">{resource.title || 'Ressource sans titre'}</h3>
          {resource.description && (
            <p className="text-gray-600 mb-4">{resource.description}</p>
          )}
          {resource.course_content && (
            <CourseContentDisplay 
              stepId={stepId}
              substepTitle={substepTitle}
              stepTitle={stepTitle || resource.title || ""}
              courseContent={resource.course_content}
            />
          )}
        </div>
      ))}
    </div>
  );
}
