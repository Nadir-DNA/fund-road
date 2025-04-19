
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function StepDetailSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingIndicator size="lg" className="mb-4" />
      <p className="text-muted-foreground">Chargement du contenu...</p>
    </div>
  );
}
