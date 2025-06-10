
import { useState } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface LegalStatusComparisonProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  sas: string;
  sarl: string;
  micro: string;
  conclusion: string;
}

export default function LegalStatusComparison({ stepId, substepTitle }: LegalStatusComparisonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const defaultValues: FormData = {
    sas: "",
    sarl: "",
    micro: "",
    conclusion: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="legal_status_comparison"
      title="Comparateur de statuts juridiques"
      description="Comparez les avantages et inconvénients des principaux statuts en fonction de votre situation."
      defaultValues={defaultValues}
      exportPanel={
        <ExportPanel 
          formData={defaultValues}
          resourceType="legal_status_comparison"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>SAS</Label>
            <Textarea
              placeholder="Souplesse, associés, charges sociales, formalités..."
              value={formData?.sas || ""}
              onChange={(e) => handleFormChange("sas", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>SARL</Label>
            <Textarea
              placeholder="Dirigeant majoritaire/minoritaire, RSI, rigidité des statuts..."
              value={formData?.sarl || ""}
              onChange={(e) => handleFormChange("sarl", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Micro-entreprise</Label>
            <Textarea
              placeholder="Facilité de gestion, seuils de CA, imposition..."
              value={formData?.micro || ""}
              onChange={(e) => handleFormChange("micro", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Conclusion personnelle</Label>
            <Textarea
              placeholder="Ce que vous retenez et envisagez comme statut pour votre projet"
              value={formData?.conclusion || ""}
              onChange={(e) => handleFormChange("conclusion", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
