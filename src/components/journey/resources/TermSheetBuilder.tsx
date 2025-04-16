import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface TermSheetBuilderProps {
  stepId: number;
  substepTitle: string;
}

export default function TermSheetBuilder({ stepId, substepTitle }: TermSheetBuilderProps) {
  const [formData, setFormData] = useState({
    round_amount: "",
    valuation: "",
    investor_type: "",
    use_of_funds: "",
    governance_rights: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="term_sheet_builder"
      title="Term Sheet simplifiée"
      description="Posez les bases des conditions d’investissement envisagées (non contractuelles)."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Montant de la levée</Label>
          <Textarea
            placeholder="Ex : 500 000 €"
            value={formData.round_amount}
            onChange={(e) => handleChange("round_amount", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Valorisation visée</Label>
          <Textarea
            placeholder="Ex : 2 000 000 € post-money"
            value={formData.valuation}
            onChange={(e) => handleChange("valuation", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Type d’investisseurs recherchés</Label>
          <Textarea
            placeholder="Ex : business angels, VC early stage, family office..."
            value={formData.investor_type}
            onChange={(e) => handleChange("investor_type", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Utilisation des fonds</Label>
          <Textarea
            placeholder="Recrutement, produit, acquisition client, marketing..."
            value={formData.use_of_funds}
            onChange={(e) => handleChange("use_of_funds", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Droits de gouvernance prévus</Label>
          <Textarea
            placeholder="Board, veto, reporting, clause de sortie..."
            value={formData.governance_rights}
            onChange={(e) => handleChange("governance_rights", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
