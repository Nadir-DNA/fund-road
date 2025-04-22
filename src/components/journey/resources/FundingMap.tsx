import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface FundingMapProps {
  stepId: number;
  substepTitle: string;
}

export default function FundingMap({ stepId, substepTitle }: FundingMapProps) {
  const [formData, setFormData] = useState({
    startup_stage: "",
    amount_needed: "",
    geography: "",
    business_type: "",
    funding_options_considered: "",
    preferred_funding_path: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="funding_map"
      title="Cartographie des financements possibles"
      description="Identifiez les sources de financement pertinentes pour votre startup."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">

        <Card className="p-5">
          <Label>Stade de maturité</Label>
          <Input
            placeholder="Idéation / MVP / Pré-revenus / Traction / Croissance"
            value={formData.startup_stage}
            onChange={(e) => handleChange("startup_stage", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Montant recherché</Label>
          <Input
            placeholder="Ex : 10k€, 100k€, 1M€"
            value={formData.amount_needed}
            onChange={(e) => handleChange("amount_needed", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Zone géographique</Label>
          <Input
            placeholder="France / Afrique / Europe / International..."
            value={formData.geography}
            onChange={(e) => handleChange("geography", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Type de projet / secteur</Label>
          <Input
            placeholder="SaaS, e-commerce, impact, santé, deeptech..."
            value={formData.business_type}
            onChange={(e) => handleChange("business_type", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Options déjà envisagées</Label>
          <Textarea
            placeholder="Subvention, prêt d’honneur, BA, VC, BPI, crowdfunding..."
            value={formData.funding_options_considered}
            onChange={(e) => handleChange("funding_options_considered", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Chemin de financement préféré</Label>
          <Textarea
            placeholder="Votre stratégie idéale de financement dans les 12 prochains mois"
            value={formData.preferred_funding_path}
            onChange={(e) => handleChange("preferred_funding_path", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
