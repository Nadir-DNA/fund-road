
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
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
  isLoading, 
  materials 
}: OverviewTabProps) {
  
  // Find courses in materials
  const courseContent = materials?.find(m => m.resource_type === 'course')?.course_content;
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement du contenu...</span>
      </div>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <div className="bg-slate-700/30 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">
          Aucun contenu de cours disponible pour {substepTitle || stepTitle}.
        </p>
      </div>
    );
  }

  // If we have course content, display it
  if (courseContent) {
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
