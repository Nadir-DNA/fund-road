
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
  console.log("OverviewTab - Contenu du cours:", courseContent ? `Disponible (longueur: ${courseContent.length})` : "Non disponible");
  
  return (
    <div className="py-4 w-full">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : courseContent && courseContent.trim().length > 0 ? (
        <>
          <h3 className="text-lg font-semibold mb-4">Contenu du cours</h3>
          <CourseContentDisplay 
            stepId={step.id} 
            substepTitle={selectedSubStep?.title || null} 
            stepTitle={step.title}
            courseContent={courseContent}
          />
        </>
      ) : (
        <div className="space-y-6 max-w-full">
          <Card className="p-6 bg-slate-700">
            <div className="flex flex-col items-center justify-center text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contenu non disponible</h3>
              <p className="text-muted-foreground max-w-md">
                Le contenu de ce cours n'est pas encore disponible.
              </p>
            </div>
          </Card>
          
          {step.detailedDescription && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description détaillée</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{step.detailedDescription}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
