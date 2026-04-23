import { Target, TrendingUp, FileCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FundReadinessBadgeProps {
  score: number;           // 0-100 : Fund Readiness Score
  dataRoomPercent: number; // 0-100
  metricsConnected: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SCORE_COLORS = [
  { min: 0,  max: 25,  label: 'À démarrer',   color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  { min: 25, max: 50,  label: 'En cours',     color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { min: 50, max: 75,  label: 'Bien avancé',  color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { min: 75, max: 90,  label: 'Presque prêt', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { min: 90, max: 101, label: 'Data room OK', color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/30' },
];

function getScoreMeta(score: number) {
  return SCORE_COLORS.find(c => score >= c.min && score < c.max) ?? SCORE_COLORS[4];
}

export function FundReadinessBadge({ 
  score, 
  dataRoomPercent, 
  metricsConnected, 
  size = 'md' 
}: FundReadinessBadgeProps) {
  const meta = getScoreMeta(score);
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  };
  
  return (
    <div className="flex items-center gap-3">
      {/* Cercle de progression */}
      <div className={cn(
        "relative rounded-full flex items-center justify-center font-bold shadow-lg",
        sizeClasses[size],
        meta.bg
      )}>
        <span className={meta.color}>{score}</span>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.5"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${score}, 100`}
            className={cn("transition-all duration-700", meta.color)}
          />
        </svg>
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-foreground text-sm">{meta.label}</span>
        <span className="text-xs text-foreground/40">
          {dataRoomPercent}% data room • {metricsConnected ? 'Métriques OK' : 'Métriques manquantes'}
        </span>
      </div>
    </div>
  );
}

/** 
 * Mini indicateur de progression pour une étape 
 */
export function StepProgressIndicator({ 
  percent, 
  label 
}: { 
  percent: number; 
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percent >= 100 ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-foreground/50">{label}</span>
    </div>
  );
}

/**
 * Bannière de statut du dossier (remplace l'ancien StreakBanner)
 */
export function DossierStatusBanner({ score }: { score: number }) {
  const meta = getScoreMeta(score);
  
  return (
    <div className={cn(
      "rounded-lg p-3 flex items-center gap-3 border",
      meta.bg, meta.border
    )}>
      {score >= 90 ? (
        <FileCheck className="w-5 h-5 text-emerald-400" />
      ) : (
        <TrendingUp className={cn("w-5 h-5", meta.color)} />
      )}
      <div>
        <p className={cn("font-semibold text-sm", meta.color)}>
          {meta.label} — {score}/100
        </p>
        <p className="text-xs text-foreground/40">
          {score < 50 
            ? 'Commencez par uploader votre pitch deck et connecter vos métriques.'
            : score < 75
            ? 'Votre dossier avance bien. Finalisez votre business plan.'
            : score < 90
            ? 'Presque là ! Contactez des investisseurs via Fund Road.'
            : 'Votre data room est prête. Lancez votre roadshow !'
          }
        </p>
      </div>
    </div>
  );
}
