
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface LegalStatusComparisonProps {
  stepId: number;
  substepTitle: string;
}

export default function LegalStatusComparison({ stepId, substepTitle }: LegalStatusComparisonProps) {
  const [formData, setFormData] = useState({
    sas: "",
    sarl: "",
    micro: "",
    conclusion: ""
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="legal_status_comparison"
      title="Comparateur de statuts juridiques"
      description="Comparez les avantages et inconvénients des principaux statuts en fonction de votre situation."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
      exportPanel={
        <ExportPanel 
          formData={formData}
          resourceType="legal_status_comparison"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>SAS</Label>
          <Textarea
            placeholder="Souplesse, associés, charges sociales, formalités..."
            value={formData.sas}
            onChange={(e) => handleChange("sas", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>SARL</Label>
          <Textarea
            placeholder="Dirigeant majoritaire/minoritaire, RSI, rigidité des statuts..."
            value={formData.sarl}
            onChange={(e) => handleChange("sarl", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Micro-entreprise</Label>
          <Textarea
            placeholder="Facilité de gestion, seuils de CA, imposition..."
            value={formData.micro}
            onChange={(e) => handleChange("micro", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Conclusion personnelle</Label>
          <Textarea
            placeholder="Ce que vous retenez et envisagez comme statut pour votre projet"
            value={formData.conclusion}
            onChange={(e) => handleChange("conclusion", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
