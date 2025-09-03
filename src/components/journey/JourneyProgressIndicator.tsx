
import { Progress } from "@/components/ui/progress";
import { Flag, TrendingUp } from "lucide-react";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { Skeleton } from "@/components/ui/skeleton";

export default function JourneyProgressIndicator() {
  const { progress, isLoading } = useJourneyProgress(journeySteps);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto mb-12 glass-card p-6 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mb-12 glass-card p-6 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Progression du parcours</h3>
        <span className="text-primary font-bold">{progress.percentage}%</span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          <span className="text-sm">{progress.completedSteps}/{progress.totalSteps} étapes abordées</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm">{progress.completedSubsteps}/{progress.totalSubsteps} sous-tâches complétées</span>
        </div>
      </div>
    </div>
  );
}
