
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ExperimentSummaryProps {
  stepId: number;
  substepTitle: string;
}

export default function ExperimentSummary({ stepId, substepTitle }: ExperimentSummaryProps) {
  const [formData, setFormData] = useState({
    hypothesis_tested: "",
    number_of_tests: "",
    overall_feedback: "",
    conclusion: "",
    next_steps: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="experiment_summary"
      title="Synthèse des tests utilisateurs"
      description="Résumez les retours obtenus sur votre solution ou prototype. Objectif : valider ou non une hypothèse de départ."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5">
          <Label>Hypothèse testée</Label>
          <Textarea
            placeholder="Quelle hypothèse vouliez-vous valider ?"
            className="min-h-[100px]"
            value={formData.hypothesis_tested}
            onChange={(e) => handleChange("hypothesis_tested", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Nombre de retours collectés</Label>
          <Textarea
            placeholder="Ex: 8 retours suite à une landing page / 5 entretiens utilisateurs"
            className="min-h-[100px]"
            value={formData.number_of_tests}
            onChange={(e) => handleChange("number_of_tests", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Retour global</Label>
          <Textarea
            placeholder="Quelle tendance générale ressort des feedbacks ?"
            className="min-h-[100px]"
            value={formData.overall_feedback}
            onChange={(e) => handleChange("overall_feedback", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Conclusion</Label>
          <Textarea
            placeholder="Hypothèse validée, partiellement validée, invalidée ?"
            className="min-h-[100px]"
            value={formData.conclusion}
            onChange={(e) => handleChange("conclusion", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Actions suivantes</Label>
          <Textarea
            placeholder="Que faites-vous maintenant suite à ce test ?"
            className="min-h-[100px]"
            value={formData.next_steps}
            onChange={(e) => handleChange("next_steps", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
