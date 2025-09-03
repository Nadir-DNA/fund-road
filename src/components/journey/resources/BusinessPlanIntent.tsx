
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface BusinessPlanIntentProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  purpose: string;
  audience: string;
  expected_outcomes: string;
  internal_use: string;
  strategic_messages: string;
}

export default function BusinessPlanIntent({ stepId, substepTitle }: BusinessPlanIntentProps) {
  const defaultValues: FormData = {
    purpose: "",
    audience: "",
    expected_outcomes: "",
    internal_use: "",
    strategic_messages: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="business_plan_intent"
      title="Fiche d'intention stratégique du Business Plan"
      description="Précisez pourquoi vous rédigez un BP, à qui il est destiné et ce que vous voulez démontrer."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Pourquoi créez-vous un Business Plan ?</Label>
            <Textarea
              placeholder="Ex : cadrer ma stratégie, préparer une levée de fonds, structurer mes idées..."
              className="min-h-[100px]"
              value={formData?.purpose || ""}
              onChange={(e) => handleFormChange("purpose", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>À qui est-il destiné ?</Label>
            <Textarea
              placeholder="Ex : fonds VC, banque, incubateur, équipe fondatrice..."
              className="min-h-[100px]"
              value={formData?.audience || ""}
              onChange={(e) => handleFormChange("audience", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Qu'attendez-vous comme résultat ?</Label>
            <Textarea
              placeholder="Ex : obtenir un financement, convaincre un partenaire stratégique, recruter une équipe..."
              className="min-h-[100px]"
              value={formData?.expected_outcomes || ""}
              onChange={(e) => handleFormChange("expected_outcomes", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Utilisation interne du BP</Label>
            <Textarea
              placeholder="Ex : suivi roadmap, alignement cofondateurs, base de décisions..."
              className="min-h-[100px]"
              value={formData?.internal_use || ""}
              onChange={(e) => handleFormChange("internal_use", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Messages stratégiques clés</Label>
            <Textarea
              placeholder="Quels sont les messages que vous souhaitez faire passer ?"
              className="min-h-[100px]"
              value={formData?.strategic_messages || ""}
              onChange={(e) => handleFormChange("strategic_messages", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
