import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { UserProgress, WeeklyChecklistItem } from "@/types/gamification";

const DEFAULT_PROGRESS: UserProgress = {
  user_id: '',
  fund_readiness_score: 0,
  data_room_completion: 0,
  metrics_connected: false,
  roadmap_progress_percent: 0,
  substeps_completed: 0,
  substeps_total: 0,
  last_active_at: new Date().toISOString(),
  documents_uploaded: 0,
  investor_contacts_made: 0,
  weekly_checklist: [],
  week_started_at: new Date().toISOString(),
};

const DEFAULT_WEEKLY_CHECKLIST: WeeklyChecklistItem[] = [
  {
    id: 'connect-metrics',
    title: 'Connecter ses métriques',
    description: 'Lier Stripe, QuickBooks ou rentrer ses KPIs manuellement',
    completed: false,
    category: 'metric',
    priority: 'high',
  },
  {
    id: 'upload-pitch',
    title: 'Uploader son pitch deck',
    description: 'Version PDF ou lien Figma/Canva',
    completed: false,
    category: 'document',
    priority: 'high',
  },
  {
    id: 'complete-bp',
    title: 'Finaliser son business plan',
    description: 'Remplir les sections marché, concurrence, équipe',
    completed: false,
    category: 'document',
    priority: 'medium',
  },
  {
    id: 'contact-3-investors',
    title: 'Contacter 3 investisseurs',
    description: 'Utiliser la liste filtrée de Fund Road',
    completed: false,
    category: 'network',
    priority: 'high',
  },
  {
    id: 'validate-cap-table',
    title: 'Valider sa cap table',
    description: 'Vérifier les pourcentages et clauses',
    completed: false,
    category: 'document',
    priority: 'medium',
  },
];

export function useProgress(userId: string) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Charger la progression
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const loadProgress = async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        setProgress({
          ...DEFAULT_PROGRESS,
          ...data,
          weekly_checklist: data.weekly_checklist ?? DEFAULT_WEEKLY_CHECKLIST,
        } as UserProgress);
      } else {
        // Première visite — initialiser avec defaults
        setProgress(prev => ({
          ...prev,
          user_id: userId,
          weekly_checklist: DEFAULT_WEEKLY_CHECKLIST,
        }));
      }
      setLoading(false);
    };
    
    loadProgress();
  }, [userId]);

  // Mettre à jour un score (ex: data_room_completion)
  const updateScore = useCallback(async (field: keyof UserProgress, value: number | boolean) => {
    setProgress(prev => ({ ...prev, [field]: value }));
    
    await supabase
      .from('user_progress')
      .upsert({ 
        user_id: userId, 
        [field]: value,
        updated_at: new Date().toISOString(),
      });
  }, [userId]);

  // Cocher/décocher un item de la checklist hebdo
  const toggleChecklistItem = useCallback(async (itemId: string) => {
    setProgress(prev => {
      const updated = prev.weekly_checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...prev, weekly_checklist: updated };
    });

    // Persister
    const { data } = await supabase
      .from('user_progress')
      .select('weekly_checklist')
      .eq('user_id', userId)
      .single();
    
    const current = (data?.weekly_checklist as WeeklyChecklistItem[]) ?? DEFAULT_WEEKLY_CHECKLIST;
    const updated = current.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    await supabase
      .from('user_progress')
      .upsert({ user_id: userId, weekly_checklist: updated });
  }, [userId]);

  // Recalculer le Fund Readiness Score
  const calculateReadiness = useCallback(() => {
    setProgress(prev => {
      let score = 0;
      // Data room = 40%
      score += (prev.data_room_completion * 0.4);
      // Métriques = 25%
      score += (prev.metrics_connected ? 25 : 0);
      // Roadmap = 20%
      score += (prev.roadmap_progress_percent * 0.2);
      // Activité récente = 15%
      const hasActivity = prev.documents_uploaded > 0 && prev.investor_contacts_made > 0;
      score += (hasActivity ? 15 : 0);
      
      return { ...prev, fund_readiness_score: Math.round(score) };
    });
  }, []);

  return {
    progress,
    loading,
    updateScore,
    toggleChecklistItem,
    calculateReadiness,
  };
}
