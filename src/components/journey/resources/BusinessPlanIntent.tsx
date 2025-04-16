import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface BusinessPlanIntentProps {
  stepId: number;
  substepTitle: string;
}

export default function BusinessPlanIntent({ stepId, substepTitle }: BusinessPlanIntentProps) {
  const [formData, setFormData] = useState({
    purpose: "",
    audience: "",
    expected_outcomes: "",
    internal_use: "",
    strategic_messages: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="business_plan_intent"
      title="Fiche d’intention stratégique du Business Plan"
      description="Précisez pourquoi vous rédigez un BP, à qui il est destiné et ce que vous voulez démontrer."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">

        <Card className="p-5">
          <Label>Pourquoi créez-vous un Business Plan ?</Label>
          <Textarea
            placeholder="Ex : cadrer ma stratégie, préparer une levée de fonds, structurer mes idées..."
            className="min-h-[100px]"
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>À qui est-il destiné ?</Label>
          <Textarea
            placeholder="Ex : fonds VC, banque, incubateur, équipe fondatrice..."
            className="min-h-[100px]"
            value={formData.audience}
            onChange={(e) => handleChange("audience", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Qu’attendez-vous comme résultat ?</Label>
          <Textarea
            placeholder="Ex : obtenir un financement, convaincre un partenaire stratégique, recruter une équipe..."
            className="min-h-[100px]"
            value={formData.expected_outcomes}
            onChange={(e) => handleChange("expected_outcomes", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Utilisation interne du BP</Label>
          <Textarea
            placeholder="Ex : suivi roadmap, alignement cofondateurs, base de décisions..."
            className="min-h-[100px]"
            value={formData.internal_use}
            onChange={(e) => handleChange("internal_use", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Messages stratégiques clés</Label>
          <Textarea
            placeholder="Quels sont les messages que vous souhaitez faire passer ?"
            className="min-h-[100px]"
            value={formData.strategic_messages}
            onChange={(e) => handleChange("strategic_messages", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
