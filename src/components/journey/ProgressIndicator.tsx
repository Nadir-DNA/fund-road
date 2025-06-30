
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CheckCircle } from "lucide-react";

interface ProgressIndicatorProps {
  totalInputs: number;
  filledInputs: number;
  progressPercentage: number;
  isUpdating?: boolean;
  title?: string;
  compact?: boolean;
}

export default function ProgressIndicator({
  totalInputs,
  filledInputs,
  progressPercentage,
  isUpdating = false,
  title,
  compact = false
}: ProgressIndicatorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-slate-300">
            {filledInputs}/{totalInputs} champs
          </span>
        </div>
        <Badge variant="secondary" className="bg-slate-700">
          {progressPercentage}%
        </Badge>
        {isUpdating && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <Card className="border-slate-600 bg-slate-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          {title || "Progression"}
          {isUpdating && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">
              {filledInputs} / {totalInputs} champs remplis
            </span>
            <span className="font-medium text-white">
              {progressPercentage}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Début</span>
            <span>Complet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
