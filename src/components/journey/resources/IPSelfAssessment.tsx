
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface IPSelfAssessmentProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  strategic_value: string;
  innovation_type: string;
  competitive_advantage: string;
  risk_of_copy: string;
  valorisation_impact: string;
}

export default function IPSelfAssessment({ stepId, substepTitle }: IPSelfAssessmentProps) {
  const defaultValues: FormData = {
    strategic_value: "",
    innovation_type: "",
    competitive_advantage: "",
    risk_of_copy: "",
    valorisation_impact: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="ip_self_assessment"
      title="Auto-diagnostic stratégique de la PI"
      description="Évaluez la pertinence stratégique de protéger vos actifs immatériels (code, méthode, nom, design…)."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Quel rôle joue votre innovation dans la stratégie de votre projet ?</Label>
            <Textarea
              placeholder="Ex : cœur de l'avantage concurrentiel, élément de réassurance, barrière à l'entrée... "
              value={formData?.strategic_value || ""}
              onChange={(e) => handleFormChange("strategic_value", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quel type d'innovation cherchez-vous à protéger ?</Label>
            <Textarea
              placeholder="Ex : nom de marque, algorithme, technologie, modèle économique, design…"
              value={formData?.innovation_type || ""}
              onChange={(e) => handleFormChange("innovation_type", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quel avantage concurrentiel cela vous apporte-t-il ?</Label>
            <Textarea
              placeholder="Ex : unicité fonctionnelle, expérience utilisateur, rapidité d'exécution, exclusivité"
              value={formData?.competitive_advantage || ""}
              onChange={(e) => handleFormChange("competitive_advantage", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quel est le risque de copie / réplication par un concurrent ?</Label>
            <Textarea
              placeholder="Est-ce facile à reproduire sans vous ? En combien de temps ? Avec quels moyens ?"
              value={formData?.risk_of_copy || ""}
              onChange={(e) => handleFormChange("risk_of_copy", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quel impact une protection peut-elle avoir sur votre valorisation ?</Label>
            <Textarea
              placeholder="Ex : effet de réassurance pour les investisseurs, valorisation d'actif au bilan"
              value={formData?.valorisation_impact || ""}
              onChange={(e) => handleFormChange("valorisation_impact", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
