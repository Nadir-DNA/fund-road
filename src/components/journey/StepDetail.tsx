
import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { useNavigate } from "react-router-dom";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";
import StepDetailDialog from "./step-detail/StepDetailDialog";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
  selectedSubSubStepTitle?: string | null;
  onClose: () => void;
}

export default function StepDetail({ step, selectedSubStep, selectedSubSubStepTitle, onClose }: StepDetailProps) {
  const navigate = useNavigate();

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
        (selectedSubSubStepTitle ? material.subsubstep_title === selectedSubSubStepTitle : !material.subsubstep_title)
      : material.substep_title === null)
  );

  const courseContent = courseMaterial?.course_content || "";

  const handleDialogClose = () => {
    console.log("Dialog close handler called in StepDetail - fermeture de la popup");
    onClose(); // Use the provided onClose function from parent
  };

  return (
    <div className="px-2 w-full">
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
