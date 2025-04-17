
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface MVPSelectorProps {
  stepId: number;
  substepTitle: string;
}

export default function MVPSelector({ stepId, substepTitle }: MVPSelectorProps) {
  const [formData, setFormData] = useState({
    mvp_type: "",
    description: "",
    timeline: "",
    resources: ""
  });

  return (
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
  );
}
