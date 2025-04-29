
import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { useNavigate } from "react-router-dom";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";
import StepDetailDialog from "./step-detail/StepDetailDialog";
import { toast } from "@/components/ui/use-toast";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
  selectedSubSubStepTitle?: string | null;
  onClose: () => void;
}

export default function StepDetail({ step, selectedSubStep, selectedSubSubStepTitle, onClose }: StepDetailProps) {
  const navigate = useNavigate();

  // Log for debugging
  console.log("StepDetail rendering with:", { 
    stepId: step.id, 
    subStepTitle: selectedSubStep?.title || null,
    subSubStepTitle: selectedSubSubStepTitle || null
  });

  const { materials, isLoading: isLoadingMaterials } = useCourseMaterials(
    step.id,
    selectedSubStep?.title || null,
    selectedSubSubStepTitle
  );

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

  // Obtain course content filtered by subsubstep_title if given
  const courseMaterial = materials?.find(material =>
    material.resource_type === 'course' &&
    (selectedSubStep?.title
      ? material.substep_title === selectedSubStep.title &&
        (selectedSubSubStepTitle 
          ? material.subsubstep_title === selectedSubSubStepTitle 
          : !material.subsubstep_title || material.subsubstep_title === '')
      : material.substep_title === null)
  );

  // Log materials and found courseMaterial
  console.log("Materials array:", materials?.map(m => ({ 
    resource_type: m.resource_type,
    step_id: m.step_id, 
    substep_title: m.substep_title,
    subsubstep_title: m.subsubstep_title || "NULL"
  })));
  
  console.log("Selected course material:", courseMaterial 
    ? { 
        id: courseMaterial.id, 
        resource_type: courseMaterial.resource_type,
        substep_title: courseMaterial.substep_title,
        subsubstep_title: courseMaterial.subsubstep_title || "NULL"
      } 
    : "Not found");

  const courseContent = courseMaterial?.course_content || "";

  const handleDialogClose = () => {
    console.log("Dialog close handler called in StepDetail");
    onClose(); // Use the provided onClose function from parent
  };

  // Display toast notification if no course content found but not during loading
  useEffect(() => {
    if (!isLoadingMaterials && materials?.length && !courseContent) {
      toast({
        title: "Contenu non disponible",
        description: "Le contenu du cours pour cette section n'a pas été trouvé.",
        variant: "default"
      });
    }
  }, [isLoadingMaterials, materials, courseContent]);

  return (
    <div className="w-full">
      <StepDetailDialog
        step={step}
        selectedSubStep={selectedSubStep}
        selectedSubSubStepTitle={selectedSubSubStepTitle}
        isOpen={true}
        onClose={handleDialogClose}
        courseContent={courseContent}
        isLoading={isLoadingMaterials}
      />
    </div>
  );
}
