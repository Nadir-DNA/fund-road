// ============================================================
// PROGRESSION SYSTEM — Fund Road
// Pas de "gamification". De la réduction de friction.
// Chaque fondateur veut UNE CHOSE : son data room prête.
// ============================================================

/** 
 * Profil de progression utilisateur 
 * Remplace l'ancien système XP/Levels/Streaks 
 */
export interface UserProgress {
  user_id: string;
  
  // === Métriques business (le vrai score) ===
  fund_readiness_score: number;      // 0-100 : à quel point le dossier est prêt
  data_room_completion: number;      // % documents requis uploadés
  metrics_connected: boolean;        // Stripe/QuickBooks connecté ?
  
  // === Parcours ===
  roadmap_progress_percent: number;  // % étapes terminées
  substeps_completed: number;
  substeps_total: number;
  
  // === Activité récente (pas de streak) ===
  last_active_at: string;            // ISO date
  documents_uploaded: number;
  investor_contacts_made: number;
  
  // === Checklist hebdo (remplace les "daily quests") ===
  weekly_checklist: WeeklyChecklistItem[];
  week_started_at: string;           // ISO date, reset chaque lundi
}

export interface WeeklyChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'document' | 'metric' | 'network' | 'milestone';
  priority: 'high' | 'medium' | 'low';
}

/** 
 * Étape du roadmap avec statut 
 */
export interface RoadmapStepProgress {
  step_id: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  completion_percent: number;
  substeps_completed: number;
  substeps_total: number;
  time_spent_minutes: number;
  documents_uploaded: number;
}

/** 
 * Badge = preuve sociale, pas récompense cosmétique
 * Ex: "Data Room Complète", "Pitch Deck Validé", "Premier Contact Investisseur"
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked_at?: string;
  icon: string;
}

// ============================================================
// SMART DEFAULTS — Réduire la friction à 0
// ============================================================

export interface SmartDefaults {
  sector?: string;
  stage?: 'pre-seed' | 'seed' | 'serie-a' | 'serie-b' | 'scale';
  team_size?: number;
  mrr_estimate?: number;
  burn_rate_estimate?: number;
  funding_raised?: boolean;
}

export function getSmartDefaults(sector?: string, stage?: string): SmartDefaults {
  const defaults: SmartDefaults = {};

  if (stage === 'pre-seed') {
    defaults.mrr_estimate = 0;
    defaults.burn_rate_estimate = 3000;
    defaults.team_size = 2;
  } else if (stage === 'seed') {
    defaults.mrr_estimate = 5000;
    defaults.burn_rate_estimate = 15000;
    defaults.team_size = 5;
  } else if (stage === 'serie-a') {
    defaults.mrr_estimate = 50000;
    defaults.burn_rate_estimate = 50000;
    defaults.team_size = 15;
  } else if (stage === 'serie-b' || stage === 'scale') {
    defaults.mrr_estimate = 200000;
    defaults.burn_rate_estimate = 120000;
    defaults.team_size = 40;
  }

  if (sector === 'saas') {
    defaults.mrr_estimate = defaults.mrr_estimate ?? 8000;
  } else if (sector === 'marketplace') {
    defaults.mrr_estimate = defaults.mrr_estimate ?? 12000;
  } else if (sector === 'fintech') {
    defaults.mrr_estimate = defaults.mrr_estimate ?? 20000;
  }

  return defaults;
}
