
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface IPProceduresChecklistProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  inpi_process: string;
  oapi_process: string;
  aripo_process: string;
  preferred_jurisdiction: string;
  preparation_notes: string;
}

export default function IPProceduresChecklist({ stepId, substepTitle }: IPProceduresChecklistProps) {
  const defaultValues: FormData = {
    inpi_process: "",
    oapi_process: "",
    aripo_process: "",
    preferred_jurisdiction: "",
    preparation_notes: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="ip_procedures_checklist"
      title="Checklist de dépôt PI – INPI, OAPI, ARIPO"
      description="Comparez les démarches de dépôt de brevet ou marque en Europe et en Afrique pour choisir votre stratégie."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Procédure INPI (France / Europe)</Label>
            <Textarea
              placeholder="Étapes, délais, coûts, lien officiel, contact support..."
              value={formData?.inpi_process || ""}
              onChange={(e) => handleFormChange("inpi_process", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Procédure OAPI (Afrique francophone)</Label>
            <Textarea
              placeholder="Pays couverts, étapes, conditions, budget..."
              value={formData?.oapi_process || ""}
              onChange={(e) => handleFormChange("oapi_process", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Procédure ARIPO (Afrique anglophone)</Label>
            <Textarea
              placeholder="Zones membres, site, formalités, coûts..."
              value={formData?.aripo_process || ""}
              onChange={(e) => handleFormChange("aripo_process", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quelle juridiction privilégiez-vous et pourquoi ?</Label>
            <Textarea
              placeholder="En fonction du marché visé, des coûts ou de la stratégie"
              value={formData?.preferred_jurisdiction || ""}
              onChange={(e) => handleFormChange("preferred_jurisdiction", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Notes de préparation / pièces à anticiper</Label>
            <Textarea
              placeholder="Nom, logo, description, preuve d'usage, documents à rassembler..."
              value={formData?.preparation_notes || ""}
              onChange={(e) => handleFormChange("preparation_notes", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
