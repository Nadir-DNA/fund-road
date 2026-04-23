import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================
// MICRO-STEP WIZARD
// Une seule question à la fois. Friction = 0.
// Le fondateur voit son % de dossier avancer, pas de l'XP.
// ============================================================

export interface MicroQuestion {
  id: string;
  type: 'text' | 'number' | 'slider' | 'choice' | 'toggle' | 'auto';
  question: string;
  subtitle?: string;
  placeholder?: string;
  options?: { label: string; value: string; icon?: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  autoFill?: () => Promise<any>;
  skippable?: boolean;
}

interface MicroStepProps {
  title: string;
  subtitle: string;
  questions: MicroQuestion[];
  onComplete: (answers: Record<string, any>) => void;
  onProgress?: (percent: number) => void;
  themeColor?: string;
}

export function MicroStepWizard({
  title,
  subtitle,
  questions,
  onComplete,
  onProgress,
  themeColor = 'bg-primary',
}: MicroStepProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const currentQuestion = questions[currentIndex];
  const completionPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      onProgress?.(((currentIndex + 2) / questions.length) * 100);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAutoFill = async () => {
    if (!currentQuestion.autoFill) return;
    setIsAutoFilling(true);
    try {
      const value = await currentQuestion.autoFill();
      handleAnswer(value);
    } catch (e) {
      console.error('Auto-fill failed', e);
    }
    setIsAutoFilling(false);
  };

  const canProceed = currentQuestion.skippable || answers[currentQuestion.id] !== undefined;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header — contexte du dossier */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-foreground/50 mb-4">{subtitle}</p>
        
        {/* Progress bar */}
        <div className="flex justify-between text-xs text-foreground/40 mb-1.5">
          <span>Question {currentIndex + 1} / {questions.length}</span>
          <span className="font-medium text-primary">{completionPercent}% complété</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", themeColor)}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ x: direction * 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-2">{currentQuestion.question}</h3>
          {currentQuestion.subtitle && (
            <p className="text-foreground/50 text-sm mb-6">{currentQuestion.subtitle}</p>
          )}

          {/* Auto-fill button */}
          {currentQuestion.autoFill && !answers[currentQuestion.id] && (
            <button
              onClick={handleAutoFill}
              disabled={isAutoFilling}
              className="mb-4 text-sm text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isAutoFilling ? 'Import en cours...' : 'Remplir automatiquement depuis Stripe'}
            </button>
          )}

          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={handleAnswer}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="text-foreground/50 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(themeColor, 'text-primary-foreground hover:opacity-90')}
        >
          {currentIndex === questions.length - 1 ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// INPUT COMPONENTS
// ============================================================

function QuestionInput({ question, value, onChange }: { 
  question: MicroQuestion; 
  value: any; 
  onChange: (v: any) => void;
}) {
  switch (question.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          autoFocus
        />
      );

    case 'number':
      return (
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            placeholder={question.placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder-foreground/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            autoFocus
          />
          {question.placeholder?.includes('€') && (
            <span className="text-foreground/30 font-medium">€</span>
          )}
        </div>
      );

    case 'slider':
      return (
        <div className="py-4">
          <input
            type="range"
            min={question.min ?? 0}
            max={question.max ?? 100}
            step={question.step ?? 1}
            value={value ?? question.defaultValue ?? question.min ?? 0}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-foreground/30 mt-3">
            <span>{question.min}{question.placeholder}</span>
            <span className="text-foreground font-bold text-base">{value ?? question.defaultValue ?? 0}{question.placeholder}</span>
            <span>{question.max}{question.placeholder}</span>
          </div>
        </div>
      );

    case 'choice':
      return (
        <div className="grid grid-cols-1 gap-2">
          {question.options?.map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border transition-all text-left",
                value === opt.value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-foreground/60 hover:bg-white/5 hover:border-white/15"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                value === opt.value ? "border-primary" : "border-foreground/20"
              )}>
                {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className="font-medium text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between py-4">
          <span className="text-foreground text-sm">{question.placeholder}</span>
          <button
            onClick={() => onChange(!value)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              value ? "bg-primary" : "bg-white/15"
            )}
            aria-pressed={!!value}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ left: value ? '25px' : '3px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      );

    case 'auto':
      return (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-primary animate-pulse-subtle" />
          </div>
          <p className="text-foreground/50 text-sm">Cette donnée est importée automatiquement</p>
          {value && (
            <pre className="text-foreground text-sm mt-3 bg-white/5 rounded-lg p-3 text-left overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      );

    default:
      return null;
  }
}
