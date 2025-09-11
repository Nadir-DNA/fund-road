
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface RoadmapHeaderProps {
  isAuthenticated: boolean;
  lastVisitedStep: { stepId: number; substepTitle: string | null; } | null;
  isLoading: boolean;
  authLoading: boolean;
  isNavigating: boolean;
  onContinueJourney: () => void;
  t: (key: string) => string;
}

export default function RoadmapHeader({
  isAuthenticated,
  lastVisitedStep,
  isLoading,
  authLoading,
  isNavigating,
  onContinueJourney,
  t
}: RoadmapHeaderProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Parcours Entrepreneurial
      </h1>
      <p className="text-xl text-white/70 max-w-3xl mx-auto">
        Suivez ces étapes pour transformer votre idée en entreprise, avec des ressources dédiées à chaque phase.
      </p>
      
      {!isLoading && lastVisitedStep ? (
        <Button 
          onClick={onContinueJourney}
          className="mt-6 bg-gradient-to-r from-primary to-accent text-white px-8"
          disabled={isLoading || isNavigating}
        >
          {isNavigating ? (
            <LoadingIndicator size="sm" className="mr-2" />
          ) : (
            <BookOpen className="mr-2 h-4 w-4" />
          )}
          {t("roadmap.continueJourney") || "Reprendre mon parcours"}
          {!isNavigating && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      ) : authLoading ? (
        <Skeleton className="h-11 w-60 mx-auto mt-6" />
      ) : null}
    </div>
  );
}
