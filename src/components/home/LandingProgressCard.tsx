import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, PlayCircle, CheckCircle2 } from "lucide-react";
import { useOverallProgress } from "@/hooks/useOverallProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { cn } from "@/lib/utils";

export default function LandingProgressCard() {
  const { overallProgress, isLoading } = useOverallProgress();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 flex justify-center">
          <LoadingIndicator size="md" />
        </CardContent>
      </Card>
    );
  }

  const { totalInputs, filledInputs, progressPercentage } = overallProgress;
  const hasProgress = totalInputs > 0;

  const statusConfig = {
    empty: { label: 'Pas encore commencé', color: 'text-foreground/40', bg: 'bg-foreground/5', icon: PlayCircle },
    early: { label: 'En cours', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: TrendingUp },
    mid: { label: 'Bien avancé', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: TrendingUp },
    late: { label: 'Presque prêt', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: TrendingUp },
    done: { label: 'Data room complète', color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle2 },
  };

  const status = !hasProgress ? 'empty' 
    : progressPercentage >= 100 ? 'done'
    : progressPercentage >= 75 ? 'late'
    : progressPercentage >= 40 ? 'mid'
    : 'early';
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="glass-card shadow-2xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={cn("h-5 w-5", config.color)} />
              <span className="font-semibold text-foreground">Votre progression</span>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("border", config.bg, config.color)}
            >
              {progressPercentage}%
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/5"
            />
            <div className="flex justify-between text-xs text-foreground/40">
              <span>
                {hasProgress ? `${filledInputs} champs complétés` : 'Commencez par remplir vos métriques'}
              </span>
              <span>{totalInputs} au total</span>
            </div>
          </div>

          {/* Message contextuel */}
          <p className={cn("text-sm text-center", config.color)}>
            {config.label}
          </p>

          {/* CTA */}
          <Button 
            asChild 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link to="/roadmap" className="flex items-center justify-center gap-2">
              {hasProgress ? "Continuer mon parcours" : "Commencer mon parcours"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
