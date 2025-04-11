
import { Step, SubStep } from "@/types/journey";
import CourseContentDisplay from "./CourseContentDisplay";

interface OverviewTabProps {
  step: Step;
  selectedSubStep: SubStep | null;
  isLoading: boolean;
  courseContent: string;
}

export default function OverviewTab({ step, selectedSubStep, isLoading }: OverviewTabProps) {
  return (
    <div className="py-4">
      <CourseContentDisplay 
        stepId={step.id} 
        substepTitle={selectedSubStep?.title || null} 
        stepTitle={step.title}
      />
      
      {!isLoading && !selectedSubStep && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description détaillée</h3>
            <p className="text-muted-foreground">{step.detailedDescription}</p>
          </div>
          
          {step.subSteps && step.subSteps.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sous-étapes</h3>
              <div className="space-y-3">
                {step.subSteps.map((subStep, i) => (
                  <li key={i} className="p-4 border rounded-lg list-none">
                    <h4 className="font-medium">{subStep.title}</h4>
                    <p className="text-muted-foreground mt-1">{subStep.description}</p>
                  </li>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
