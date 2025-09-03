
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useUnifiedCourseMaterials } from "@/hooks/course/useUnifiedCourseMaterials";
import CourseContentDisplay from "../CourseContentDisplay";

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
  isLoading: propIsLoading,
  materials: propMaterials
}: OverviewTabProps) {
  
  // Use unified hook for consistent data fetching
  const { data: materials, isLoading: courseMaterialsLoading, error } = useUnifiedCourseMaterials(stepId, substepTitle);
  
  console.log(`📄 OverviewTab (main) - Step ${stepId}, Substep: ${substepTitle || 'main'}, Materials: ${materials?.length || 0}`);
  
  // Find course content in materials
  const courseContent = materials?.find(m => m.resource_type === 'course')?.course_content || "";
  
  const isLoading = propIsLoading || courseMaterialsLoading;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement du contenu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium mb-2 text-destructive">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger le contenu pour {substepTitle || stepTitle}.
        </p>
      </div>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">
          Aucun contenu de cours disponible pour {substepTitle || stepTitle}.
        </p>
        <p className="text-xs mt-2 text-muted-foreground/70">
          Étape {stepId} - {substepTitle || 'Étape principale'}
        </p>
      </div>
    );
  }

  // If we have course content, display it
  if (courseContent && courseContent.trim() !== "") {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6">
        <CourseContentDisplay
          stepId={stepId}
          substepTitle={substepTitle}
          stepTitle={stepTitle}
          courseContent={courseContent}
        />
      </div>
    );
  }

  // If we have other materials but no course content
  return (
    <div className="bg-slate-700/30 rounded-lg p-6">
      <p className="mb-4">Matériaux disponibles pour cette section:</p>
      <ul className="list-disc pl-5 space-y-2">
        {materials.map((material, idx) => (
          <li key={idx}>
            {material.title || material.resource_type || "Ressource sans titre"}
          </li>
        ))}
      </ul>
    </div>
  );
}
