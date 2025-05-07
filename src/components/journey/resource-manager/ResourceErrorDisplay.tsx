
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ResourceErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

export default function ResourceErrorDisplay({ error, onRetry }: ResourceErrorDisplayProps) {
  return (
    <div className="p-6 text-center border rounded-lg bg-muted/20">
      <p className="text-muted-foreground">{error || "Ressource non trouvée ou non disponible."}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}
