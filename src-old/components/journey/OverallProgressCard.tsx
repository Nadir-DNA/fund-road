
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Trophy } from "lucide-react";
import { useOverallProgress } from "@/hooks/useOverallProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function OverallProgressCard() {
  const { overallProgress, isLoading, refreshProgress } = useOverallProgress();

  if (isLoading) {
    return (
      <Card className="border-slate-600 bg-slate-800/50">
        <CardContent className="p-6 flex justify-center">
          <LoadingIndicator size="md" />
        </CardContent>
      </Card>
    );
  }

  const { totalInputs, filledInputs, progressPercentage } = overallProgress;

  return (
    <Card className="border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Progression Globale
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshProgress}
            className="h-8 w-8 p-0 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{filledInputs}</div>
              <div className="text-xs text-slate-400">Champs remplis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalInputs}</div>
              <div className="text-xs text-slate-400">Total des champs</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Avancement</span>
              <Badge 
                variant="secondary" 
                className={`${
                  progressPercentage >= 80 
                    ? 'bg-green-600 text-white' 
                    : progressPercentage >= 50 
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-600 text-slate-200'
                }`}
              >
                {progressPercentage}%
              </Badge>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-slate-700"
            />
          </div>

          {/* Motivational message */}
          <div className="text-center text-sm">
            {progressPercentage === 100 ? (
              <span className="text-green-400 font-medium">
                🎉 Félicitations ! Vous avez complété votre parcours !
              </span>
            ) : progressPercentage >= 80 ? (
              <span className="text-yellow-400">
                🔥 Plus que quelques champs pour finir !
              </span>
            ) : progressPercentage >= 50 ? (
              <span className="text-blue-400">
                💪 Vous êtes à mi-parcours, continuez !
              </span>
            ) : progressPercentage > 0 ? (
              <span className="text-slate-400">
                🚀 Bon début ! Continuez à remplir vos ressources
              </span>
            ) : (
              <span className="text-slate-500">
                📝 Commencez à remplir vos ressources pour voir votre progression
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
