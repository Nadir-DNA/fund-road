
import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { useNavigate } from "react-router-dom";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";
import StepDetailDialog from "./StepDetailDialog";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const navigate = useNavigate();
  
  // Utilisez le hook avec stepId et le titre de la sous-étape
  const { materials, isLoading: isLoadingMaterials, error: materialsError } = useCourseMaterials(
    step.id, 
    selectedSubStep?.title || null
  );

  // Debug pour vérifier les chargements et les erreurs
  console.log("Materials chargés:", materials?.length || 0);
  console.log("Step ID:", step.id, "SubStep:", selectedSubStep?.title || "étape principale");
  if (materialsError) console.error("Erreur de chargement des matériaux:", materialsError);

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

  // Get course content from materials
  const courseMaterial = materials?.find(material => 
    material.resource_type === 'course' && 
    (selectedSubStep?.title 
      ? material.substep_title === selectedSubStep.title 
      : material.substep_title === null)
  );

  console.log("Matériel de cours trouvé:", courseMaterial ? 'Oui' : 'Non');
  const courseContent = courseMaterial?.course_content || "";

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
