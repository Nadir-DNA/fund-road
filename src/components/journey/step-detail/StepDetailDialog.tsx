
import { Step, SubStep } from "@/types/journey";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import StepHeader from "./StepHeader";
import StepDetailContent from "./StepDetailContent";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
          {selectedSubStep && (
            <DialogDescription>{selectedSubStep.description}</DialogDescription>
          )}
        </DialogHeader>

        <StepHeader 
          step={step} 
          selectedSubStep={selectedSubStep} 
        />
        
        <div className="flex-grow overflow-auto mt-4">
          <StepDetailContent
            step={step}
            selectedSubStep={selectedSubStep}
            courseContent={courseContent}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
