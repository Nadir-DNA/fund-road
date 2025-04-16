import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface UserFeedbackFormProps {
  stepId: number;
  substepTitle: string;
}

export default function UserFeedbackForm({ stepId, substepTitle }: UserFeedbackFormProps) {
  const [formData, setFormData] = useState({
    context: "",
    user_reaction: "",
    insights: "",
    unexpected: "",
    next_hypothesis: ""
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
      resourceType="user_feedback_form"
      title="Retour utilisateur – test terrain"
      description="Notez ici le retour d’un utilisateur après avoir testé votre solution ou MVP. Objectif : extraire des insights et décider des suites."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5">
          <Label>Contexte du test</Label>
          <Textarea
            placeholder="Quel scénario de test ? (Ex : landing page, maquette, démonstration...)"
            className="min-h-[100px]"
            value={formData.context}
            onChange={(e) => handleChange("context", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Réaction de l’utilisateur</Label>
          <Textarea
            placeholder="Qu’a-t-il/elle dit, fait, exprimé ?"
            className="min-h-[100px]"
            value={formData.user_reaction}
            onChange={(e) => handleChange("user_reaction", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Apprentissages clés / insights</Label>
          <Textarea
            placeholder="Que retenez-vous de ce retour ?"
            className="min-h-[100px]"
            value={formData.insights}
            onChange={(e) => handleChange("insights", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Éléments inattendus</Label>
          <Textarea
            placeholder="Quel retour ou comportement vous a surpris ?"
            className="min-h-[100px]"
            value={formData.unexpected}
            onChange={(e) => handleChange("unexpected", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Nouvelle hypothèse à tester</Label>
          <Textarea
            placeholder="Que testerez-vous ensuite ?"
            className="min-h-[100px]"
            value={formData.next_hypothesis}
            onChange={(e) => handleChange("next_hypothesis", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
