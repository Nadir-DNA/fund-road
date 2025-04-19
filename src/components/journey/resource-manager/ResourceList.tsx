
import { Resource } from "@/types/journey";
import ResourceCard from "./ResourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

interface ResourceListProps {
  resources: Resource[];
  stepId: number;
  substepTitle: string;
  selectedResourceName?: string | null;
}

export default function ResourceList({ resources, stepId, substepTitle }: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-center text-muted-foreground">
              Toutes les ressources prévues pour cette section sont déjà disponibles.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {resources.map((resource, idx) => (
        <ResourceCard
          key={idx}
          resource={resource}
          stepId={stepId}
          substepTitle={substepTitle}
        />
      ))}
    </div>
  );
}
