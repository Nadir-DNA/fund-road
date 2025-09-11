
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function ResourceLoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingIndicator size="md" />
      <span className="ml-2">Chargement de la ressource...</span>
    </div>
  );
}
