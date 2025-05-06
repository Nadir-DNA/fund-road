
import { useParams } from "react-router-dom";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import StepNavigation from "@/components/journey/step-detail/StepNavigation";
import { useSubstepResources } from "@/hooks/useSubstepResources";
import ErrorDisplay from "@/components/journey/ErrorDisplay";
import NoResourcesDisplay from "@/components/journey/NoResourcesDisplay";
import CoursesSection from "@/components/journey/CoursesSection";
import OtherResourcesSection from "@/components/journey/OtherResourcesSection";

export default function SubstepPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam } = useParams();
  
  const stepId = stepIdParam ? parseInt(stepIdParam) : 0;
  const substepTitle = substepTitleParam || "";
  
  console.log("SubstepPage mounted with:", { stepId, substepTitle });
  
  const { data, error, isLoading, isFetching, refetch } = useSubstepResources(stepId, substepTitle);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingIndicator size="lg" />
        <span className="ml-3 text-lg">Chargement des ressources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        message={(error as Error).message} 
        details={{ 
          stepId, 
          substepTitle, 
          error: (error as Error).stack,
          retry: () => refetch()
        }} 
      />
    );
  }

  if (!data || data.length === 0) {
    return <NoResourcesDisplay stepId={stepId} substepTitle={substepTitle} />;
  }

  // Separate courses from other resources
  const courses = data.filter(r => r.type === "course");
  const otherResources = data.filter(r => r.type !== "course");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">{substepTitle}</h1>
      
      {/* Show loading indicator during background refetches */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 bg-primary/10 rounded-md p-2 z-50 flex items-center">
          <LoadingIndicator size="sm" />
          <span className="ml-2 text-xs">Actualization...</span>
        </div>
      )}

      {/* Course Content Section */}
      <CoursesSection 
        courses={courses} 
        stepId={stepId} 
        substepTitle={substepTitle}
      />

      {/* Other Resources Section */}
      <OtherResourcesSection 
        resources={otherResources} 
        stepId={stepId} 
        substepTitle={substepTitle}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV !== 'production' && (
        <details className="mt-10 p-4 border rounded-lg">
          <summary className="cursor-pointer font-medium">Debug Info</summary>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
            {JSON.stringify({ 
              stepId, 
              substepTitle, 
              resourceCount: data.length,
              courseCount: courses.length,
              otherResourceCount: otherResources.length
            }, null, 2)}
          </pre>
          <button 
            className="mt-2 px-3 py-1 bg-primary text-white text-xs rounded"
            onClick={() => refetch()}
          >
            Refresh Resources
          </button>
        </details>
      )}

      <StepNavigation stepId={stepId} substepTitle={substepTitle} />
    </div>
  );
}
