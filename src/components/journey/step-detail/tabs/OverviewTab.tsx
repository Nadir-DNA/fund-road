
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useUnifiedCourseMaterials } from "@/hooks/course/useUnifiedCourseMaterials";
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
  isLoading: propIsLoading 
}: OverviewTabProps) {
  const { data: materials, isLoading: courseMaterialsLoading, error } = useUnifiedCourseMaterials(stepId, substepTitle);
  
  console.log(`📖 OverviewTab - Step ${stepId}, Substep: ${substepTitle || 'main'}, Materials: ${materials?.length || 0}`);
  
  // Find course content in materials
  const courseContent = materials?.find(m => m.resource_type === 'cours')?.course_content || "";
  
  const isLoading = propIsLoading || courseMaterialsLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement du cours...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2 text-destructive">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger le contenu du cours pour cette section.
        </p>
        <p className="text-xs mt-2 text-muted-foreground/70">
          Étape {stepId} - {substepTitle || 'Étape principale'}
        </p>
      </div>
    );
  }
  
  if (!courseContent || courseContent.trim() === "") {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Contenu en préparation</h3>
        <p className="text-muted-foreground">
          Le contenu du cours pour cette section sera disponible prochainement.
        </p>
        <p className="text-xs mt-2 text-muted-foreground/70">
          Étape {stepId} - {substepTitle || 'Étape principale'}
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
