
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface InvestorObjectionPrepProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  traction_gap: string;
  valuation_question: string;
  team_doubt: string;
  scalability_question: string;
  other_prepared_answers: string;
}

export default function InvestorObjectionPrep({ stepId, substepTitle }: InvestorObjectionPrepProps) {
  const defaultValues: FormData = {
    traction_gap: "",
    valuation_question: "",
    team_doubt: "",
    scalability_question: "",
    other_prepared_answers: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="investor_objection_prep"
      title="Préparation aux objections"
      description="Préparez vos réponses aux objections les plus fréquentes des investisseurs."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Manque de traction</Label>
            <Textarea
              placeholder="Comment répondez-vous à une remarque du type : « Trop tôt pour nous » ?"
              value={formData?.traction_gap || ""}
              onChange={(e) => handleFormChange("traction_gap", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Question sur la valorisation</Label>
            <Textarea
              placeholder="Comment justifiez-vous le montant que vous annoncez ?"
              value={formData?.valuation_question || ""}
              onChange={(e) => handleFormChange("valuation_question", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Doute sur l'équipe</Label>
            <Textarea
              placeholder="Si l'investisseur pense que l'équipe est incomplète ?"
              value={formData?.team_doubt || ""}
              onChange={(e) => handleFormChange("team_doubt", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Scalabilité du projet</Label>
            <Textarea
              placeholder="Comment prouvez-vous que votre modèle peut grandir ?"
              value={formData?.scalability_question || ""}
              onChange={(e) => handleFormChange("scalability_question", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Autres réponses prêtes</Label>
            <Textarea
              placeholder="Anticipations diverses (propriété intellectuelle, dépendance tech...)"
              value={formData?.other_prepared_answers || ""}
              onChange={(e) => handleFormChange("other_prepared_answers", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
