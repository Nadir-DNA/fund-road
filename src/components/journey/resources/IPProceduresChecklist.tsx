import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface IPProceduresChecklistProps {
  stepId: number;
  substepTitle: string;
}

export default function IPProceduresChecklist({ stepId, substepTitle }: IPProceduresChecklistProps) {
  const [formData, setFormData] = useState({
    inpi_process: "",
    oapi_process: "",
    aripo_process: "",
    preferred_jurisdiction: "",
    preparation_notes: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="ip_procedures_checklist"
      title="Checklist de dépôt PI – INPI, OAPI, ARIPO"
      description="Comparez les démarches de dépôt de brevet ou marque en Europe et en Afrique pour choisir votre stratégie."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        
        <Card className="p-5">
          <Label>Procédure INPI (France / Europe)</Label>
          <Textarea
            placeholder="Étapes, délais, coûts, lien officiel, contact support..."
            value={formData.inpi_process}
            onChange={(e) => handleChange("inpi_process", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Procédure OAPI (Afrique francophone)</Label>
          <Textarea
            placeholder="Pays couverts, étapes, conditions, budget..."
            value={formData.oapi_process}
            onChange={(e) => handleChange("oapi_process", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Procédure ARIPO (Afrique anglophone)</Label>
          <Textarea
            placeholder="Zones membres, site, formalités, coûts..."
            value={formData.aripo_process}
            onChange={(e) => handleChange("aripo_process", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Quelle juridiction privilégiez-vous et pourquoi ?</Label>
          <Textarea
            placeholder="En fonction du marché visé, des coûts ou de la stratégie"
            value={formData.preferred_jurisdiction}
            onChange={(e) => handleChange("preferred_jurisdiction", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Notes de préparation / pièces à anticiper</Label>
          <Textarea
            placeholder="Nom, logo, description, preuve d’usage, documents à rassembler..."
            value={formData.preparation_notes}
            onChange={(e) => handleChange("preparation_notes", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
