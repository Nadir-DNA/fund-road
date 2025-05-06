
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import CourseContentDisplay from "@/components/journey/CourseContentDisplay";

interface OverviewTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  isLoading: boolean;
  materials: any[] | null;
}

export default function OverviewTab({ 
  stepId, 
  substepTitle, 
  stepTitle, 
  isLoading, 
  materials 
}: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  if (!materials || materials.length === 0 || !materials[0].course_content) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Aucun contenu de cours disponible pour cette étape.</p>
      </div>
    );
  }

  return (
    <CourseContentDisplay
      stepId={stepId}
      substepTitle={substepTitle}
      stepTitle={stepTitle}
      courseContent={materials[0].course_content}
    />
  );
}
