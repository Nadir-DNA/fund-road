import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, FileText, BarChart3, Users, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeeklyChecklistItem } from '@/types/gamification';

interface WeeklyChecklistProps {
  items: WeeklyChecklistItem[];
  onToggle: (itemId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  document: FileText,
  metric: BarChart3,
  network: Users,
  milestone: Target,
};

const PRIORITY_COLORS = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-foreground/30',
};

export function WeeklyChecklist({ items, onToggle }: WeeklyChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = items.filter(i => i.completed).length;
  const highPriorityPending = items.filter(i => !i.completed && i.priority === 'high').length;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Cette semaine</h3>
            <p className="text-xs text-foreground/40">
              {completedCount}/{items.length} terminées
              {highPriorityPending > 0 && (
                <span className="text-red-400 ml-1">• {highPriorityPending} prioritaire{highPriorityPending > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-foreground/30" />
        </motion.div>
      </button>

      {/* Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5">
              {items.map(item => {
                const Icon = CATEGORY_ICONS[item.category] || Target;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer select-none",
                      item.completed
                        ? "bg-emerald-500/5 border border-emerald-500/10"
                        : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
                    )}
                    onClick={() => onToggle(item.id)}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border transition-all",
                      item.completed 
                        ? "bg-emerald-500/15 border-emerald-500/30" 
                        : "border-foreground/10 hover:border-foreground/20"
                    )}>
                      {item.completed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 text-foreground/30" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          item.completed ? "text-emerald-300 line-through" : "text-foreground"
                        )}>
                          {item.title}
                        </p>
                        {item.priority === 'high' && !item.completed && (
                          <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-foreground/30 truncate">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
