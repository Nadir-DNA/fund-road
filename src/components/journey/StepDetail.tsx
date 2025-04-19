
import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCourseMaterials } from "@/hooks/useCourseMaterials";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";
import StepDetailDialog from "./step-detail/StepDetailDialog";

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

  // Get course content from materials
  const courseContent = materials?.find(material => 
    material.resource_type === 'course' && 
    material.substep_title === selectedSubStep?.title
  )?.course_content || "";

  const handleDialogClose = () => {
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
