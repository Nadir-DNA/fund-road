
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Step, SubStep } from "@/types/journey";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  return (
    <DialogHeader>
      <DialogTitle className="text-2xl text-gradient">
        {selectedSubStep ? selectedSubStep.title : step.title}
      </DialogTitle>
      <DialogDescription className="text-base text-white">
        {selectedSubStep 
          ? <div className="py-4">{selectedSubStep.description}</div>
          : (
            <div className="space-y-4 py-2">
              <p className="text-white text-lg">{step.detailedDescription}</p>
              
              {step.subSteps && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Étapes à suivre:</h3>
                  <ul className="space-y-3">
                    {step.subSteps.map((subStep, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="bg-primary/20 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary font-medium">{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{subStep.title}</h4>
                          <p className="text-sm text-muted-foreground">{subStep.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Ressources recommandées:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {step.resources.map((resource, idx) => (
                    <div key={idx} className="p-4 bg-primary/10 backdrop-blur-md rounded-lg border border-primary/20">
                      <h4 className="font-medium text-white mb-1">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }
      </DialogDescription>
    </DialogHeader>
  );
}
