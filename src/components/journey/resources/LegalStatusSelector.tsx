
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface LegalStatusSelectorProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  nb_associates: string;
  capital_amount: string;
  risk_level: string;
  revenue_forecast: string;
  preference: string;
  preliminary_choice: string;
}

export default function LegalStatusSelector({ stepId, substepTitle }: LegalStatusSelectorProps) {
  const defaultValues: FormData = {
    nb_associates: "",
    capital_amount: "",
    risk_level: "",
    revenue_forecast: "",
    preference: "",
    preliminary_choice: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="legal_status_selector"
      title="Sélecteur de statut juridique"
      description="Évaluez les statuts juridiques les plus adaptés à votre projet avec cette aide à la décision."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Nombre d'associés prévu</Label>
            <Input
              placeholder="Ex : 1, 2, 3..."
              value={formData?.nb_associates || ""}
              onChange={(e) => handleFormChange("nb_associates", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Montant de capital envisagé</Label>
            <Input
              placeholder="Ex : 1000 €, 10 000 €, 50 000 €..."
              value={formData?.capital_amount || ""}
              onChange={(e) => handleFormChange("capital_amount", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Niveau de risque perçu</Label>
            <Input
              placeholder="Faible / Moyen / Élevé"
              value={formData?.risk_level || ""}
              onChange={(e) => handleFormChange("risk_level", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Prévision de chiffre d'affaires sur 12 mois</Label>
            <Input
              placeholder="Ex : 0 €, 30 000 €, 100 000 €..."
              value={formData?.revenue_forecast || ""}
              onChange={(e) => handleFormChange("revenue_forecast", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Préférences ou contraintes personnelles</Label>
            <Textarea
              placeholder="Souhaitez-vous être salarié ? Avoir des aides auto-entrepreneur ?"
              value={formData?.preference || ""}
              onChange={(e) => handleFormChange("preference", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Statut juridique pressenti</Label>
            <Textarea
              placeholder="Ex : SAS, SARL, auto-entreprise..."
              value={formData?.preliminary_choice || ""}
              onChange={(e) => handleFormChange("preliminary_choice", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
