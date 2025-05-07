
import { Resource } from "@/types/journey";
import CourseContentDisplay from "../CourseContentDisplay";
import LazyLoad from "@/components/LazyLoad";
import ResourceNavigation from "./ResourceNavigation";
import ResourceHeader from "./ResourceHeader";

interface CourseResourceDisplayProps {
  selectedResource: Resource;
  resourceLocationLabel: string | null;
  stepId: number;
  selectedSubstepTitle: string;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
  onRetry: () => void;
}

export default function CourseResourceDisplay({
  selectedResource,
  resourceLocationLabel,
  stepId,
  selectedSubstepTitle,
  allResources,
  currentIndex,
  totalResources,
  onRetry
}: CourseResourceDisplayProps) {
  return (
    <div className="mt-4">
      <ResourceHeader 
        selectedResource={selectedResource} 
        resourceLocationLabel={resourceLocationLabel}
        onRetry={onRetry}
      />
      
      <p className="text-muted-foreground mb-6 text-sm">{selectedResource.description}</p>
      
      <LazyLoad priority={true} showLoader={true} height={400} delay={100}>
        <CourseContentDisplay 
          stepId={stepId}
          substepTitle={selectedSubstepTitle}
          stepTitle={selectedResource.title}
          courseContent={selectedResource.courseContent}
        />
      </LazyLoad>
      
      {totalResources > 1 && (
        <ResourceNavigation 
          stepId={stepId}
          substepTitle={selectedSubstepTitle}
          currentResource={selectedResource}
          allResources={allResources}
          currentIndex={currentIndex}
          totalResources={totalResources}
        />
      )}
    </div>
  );
}
