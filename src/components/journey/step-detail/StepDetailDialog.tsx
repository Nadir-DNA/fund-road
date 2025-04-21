
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
  // diagnostic log
  console.log("StepDetailDialog: isOpen", isOpen);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          console.log("StepDetailDialog - onOpenChange called to close modal");
          onClose(); // Notify parent to actually set isOpen to false
        }
      }}
    >
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card p-6">
        <StepHeader 
          step={step} 
          selectedSubStep={selectedSubStep} 
          onClose={() => {
            console.log("StepDetailDialog - onClose received from StepHeader");
            onClose();
          }}
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
