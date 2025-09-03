
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGlobalProgressTracker } from "@/hooks/useGlobalProgressTracker";
import { Trophy, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EnhancedProgressCard() {
  const { globalProgress, isLoading } = useGlobalProgressTracker();

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
          <div className="h-8 bg-slate-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const { totalInputs, filledInputs, progressPercentage, detailsByStep } = globalProgress;
  
  // Messages motivationnels basés sur le pourcentage
  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 0) return "Commencez votre parcours entrepreneurial ! 🚀";
    if (percentage < 25) return "Bon début ! Continuez sur cette lancée 💪";
    if (percentage < 50) return "Vous progressez bien ! 🎯";
    if (percentage < 75) return "Excellent travail ! Vous êtes sur la bonne voie 🌟";
    if (percentage < 100) return "Presque au bout ! Plus que quelques étapes ⚡";
    return "Félicitations ! Parcours terminé ! 🎉";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "from-red-500 to-orange-500";
    if (percentage < 50) return "from-orange-500 to-yellow-500";
    if (percentage < 75) return "from-yellow-500 to-blue-500";
    return "from-blue-500 to-green-500";
  };

  // Top 3 des étapes avec le plus de progression
  const topSteps = Object.entries(detailsByStep)
    .map(([stepId, data]) => ({ stepId: parseInt(stepId), ...data }))
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, 3);

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-primary/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">Progression Globale</h3>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Target className="h-3 w-3 mr-1" />
          {filledInputs}/{totalInputs}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {progressPercentage}%
          </div>
          <p className="text-sm text-muted-foreground">
            {getMotivationalMessage(progressPercentage)}
          </p>
        </div>

        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filledInputs} champs complétés</span>
            <span>{totalInputs - filledInputs} restants</span>
          </div>
        </div>

        {topSteps.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-medium text-white">Étapes en cours</h4>
            </div>
            <div className="space-y-2">
              {topSteps.map((step, index) => (
                <div key={step.stepId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      step.progressPercentage === 100 ? 'bg-green-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-muted-foreground">Étape {step.stepId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{step.progressPercentage}%</span>
                    {step.progressPercentage === 100 && (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {progressPercentage > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-primary text-center">
              💡 Tip: Complétez toutes les ressources pour débloquer de nouveaux outils !
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
