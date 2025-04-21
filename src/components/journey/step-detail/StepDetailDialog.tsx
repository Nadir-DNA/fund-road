
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";
import StepDetailContent from "./StepDetailContent";
import StepDetailSkeleton from "./StepDetailSkeleton";

interface StepDetailDialogProps {
  step: Step;
  selectedSubStep: SubStep | null;
  selectedSubSubStepTitle?: string | null;
  isOpen: boolean;
  onClose: () => void;
  courseContent: string;
  isLoading: boolean;
}

export default function StepDetailDialog({
  step,
  selectedSubStep,
  selectedSubSubStepTitle,
  isOpen,
  onClose,
  courseContent,
  isLoading
}: StepDetailDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card p-6">
        <DialogHeader className="mb-4 sm:mb-6">
          <div>
            <DialogTitle className="text-xl sm:text-2xl">{step.title}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-2">
              {selectedSubStep ? selectedSubStep.description : step.description}
            </DialogDescription>
          </div>
        </DialogHeader>
        {isLoading ? (
          <StepDetailSkeleton />
        ) : (
          <StepDetailContent
            step={step}
            selectedSubStep={selectedSubStep}
            selectedSubSubStepTitle={selectedSubSubStepTitle}
            courseContent={courseContent}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
