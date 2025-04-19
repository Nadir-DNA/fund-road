
import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";
import StepDetailDialog from "./StepDetailDialog";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const navigate = useNavigate();
  
  const { materials, isLoading: isLoadingMaterials } = useCourseMaterials(
    step.id, 
    selectedSubStep?.title || null
  );

  // Handle back navigation
  useEffect(() => {
    const handleBackNavigation = () => {
      const returnPath = getResourceReturnPath();
      if (returnPath) {
        clearResourceReturnPath();
        navigate(returnPath);
      }
    };
    
    window.addEventListener('popstate', handleBackNavigation);
    return () => window.removeEventListener('popstate', handleBackNavigation);
  }, [navigate]);

  // Debugging pour mieux comprendre le problème
  console.log("Materials récupérés:", materials);
  console.log("Étape sélectionnée:", step.id, step.title);
  console.log("Sous-étape sélectionnée:", selectedSubStep?.title || "étape principale");

  // Get course content from materials
  const courseMaterial = materials?.find(material => 
    material.resource_type === 'course' && 
    (selectedSubStep?.title 
      ? material.substep_title === selectedSubStep.title 
      : material.substep_title === null)
  );

  console.log("Matériel de cours trouvé:", courseMaterial);
  const courseContent = courseMaterial?.course_content || "";
  console.log("Contenu du cours:", courseContent ? `Disponible (longueur: ${courseContent.length})` : "Non disponible");

  const handleDialogClose = () => {
    console.log("Dialog close handler called in StepDetail");
    navigate('/roadmap', { replace: true });
  };

  return (
    <div className="px-2 w-full">
      <StepDetailDialog
        step={step}
        selectedSubStep={selectedSubStep}
        isOpen={true}
        onClose={handleDialogClose}
        courseContent={courseContent}
        isLoading={isLoadingMaterials}
      />
    </div>
  );
}
