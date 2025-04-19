
import { Step, SubStep } from "@/types/journey";
import CourseContentDisplay from "./CourseContentDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface OverviewTabProps {
  step: Step;
  selectedSubStep: SubStep | null;
  isLoading: boolean;
  courseContent: string;
}

export default function OverviewTab({ step, selectedSubStep, isLoading, courseContent }: OverviewTabProps) {
  console.log("OverviewTab received courseContent:", courseContent ? "Yes (length: " + courseContent.length + ")" : "No");
  
  return (
    <div className="py-4 w-full">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : courseContent && courseContent.trim() !== "" ? (
        <CourseContentDisplay 
          stepId={step.id} 
          substepTitle={selectedSubStep?.title || null} 
          stepTitle={step.title}
          courseContent={courseContent}
        />
      ) : (
        <div className="space-y-6 max-w-full">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contenu non disponible</h3>
              <p className="text-muted-foreground max-w-md">
                Le contenu de ce cours n'est pas encore disponible. Voici les détails de l'étape en attendant :
              </p>
            </div>
          </Card>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Description détaillée</h3>
            <p className="text-muted-foreground text-sm sm:text-base">{step.detailedDescription}</p>
          </div>
          
          {step.subSteps && step.subSteps.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sous-étapes</h3>
              <div className="space-y-3">
                {step.subSteps.map((subStep, i) => (
                  <li key={i} className="p-3 sm:p-4 border rounded-lg list-none hover:border-primary/50 transition-colors">
                    <h4 className="font-medium text-sm sm:text-base">{subStep.title}</h4>
                    <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{subStep.description}</p>
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
