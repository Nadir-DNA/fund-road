
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import { useOverallProgress } from "@/hooks/useOverallProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function LandingProgressCard() {
  const { overallProgress, isLoading } = useOverallProgress();

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-6 flex justify-center">
          <LoadingIndicator size="md" />
        </CardContent>
      </Card>
    );
  }

  const { totalInputs, filledInputs, progressPercentage } = overallProgress;

  // Don't show if no progress yet
  if (totalInputs === 0) {
    return null;
  }

  return (
    <Card className="border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-semibold">Votre progression</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${
                progressPercentage >= 80 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : progressPercentage >= 50 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {progressPercentage}%
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-slate-700/50"
            />
            <div className="flex justify-between text-sm text-white/70">
              <span>{filledInputs} champs complétés</span>
              <span>{totalInputs} au total</span>
            </div>
          </div>

          {/* Motivational message */}
          <div className="text-center">
            {progressPercentage === 100 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Félicitations ! Parcours terminé !</span>
                </div>
              </div>
            ) : progressPercentage >= 80 ? (
              <span className="text-yellow-400 text-sm">
                🔥 Plus que quelques étapes pour finir !
              </span>
            ) : progressPercentage >= 50 ? (
              <span className="text-blue-400 text-sm">
                💪 Excellent travail, continuez !
              </span>
            ) : progressPercentage > 0 ? (
              <span className="text-white/70 text-sm">
                🚀 Bon début ! Poursuivez votre parcours
              </span>
            ) : null}
          </div>

          {/* Action button */}
          <Button 
            asChild 
            className="w-full bg-primary/90 hover:bg-primary text-white"
          >
            <Link to="/roadmap" className="flex items-center justify-center gap-2">
              Continuer mon parcours
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
