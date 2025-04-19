
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";
import StepHeader from "./StepHeader";
import StepDetailContent from "./StepDetailContent";
import StepDetailSkeleton from "./StepDetailSkeleton";

interface StepDetailDialogProps {
  step: Step;
  selectedSubStep: SubStep | null;
  isOpen: boolean;
  onClose: () => void;
  courseContent: string;
  isLoading: boolean;
}

export default function StepDetailDialog({ 
  step, 
  selectedSubStep, 
  isOpen, 
  onClose,
  courseContent,
  isLoading
}: StepDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card p-6">
        <StepHeader 
          step={step} 
          selectedSubStep={selectedSubStep} 
          onClose={onClose}
        />
        {isLoading ? (
          <StepDetailSkeleton />
        ) : (
          <StepDetailContent
            step={step}
            selectedSubStep={selectedSubStep}
            courseContent={courseContent}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
