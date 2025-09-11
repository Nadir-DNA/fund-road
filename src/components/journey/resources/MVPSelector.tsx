
import { useState } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface MVPSelectorProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  mvp_type: string;
  description: string;
  timeline: string;
  resources: string;
}

export default function MVPSelector({ stepId, substepTitle }: MVPSelectorProps) {
  const defaultValues: FormData = {
    mvp_type: "",
    description: "",
    timeline: "",
    resources: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mvp_selector"
      title="Sélecteur de MVP"
      description="Choisissez le type de MVP le plus adapté à votre projet."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center flex-col gap-2 text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/60" />
              <p className="text-center text-muted-foreground mt-2">
                <strong>MVPSelector</strong> est en cours de développement.
                <br />
                Cette ressource sera disponible prochainement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </SimpleResourceForm>
  );
}
