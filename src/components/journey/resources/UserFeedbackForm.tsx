
import { useState, useCallback } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import CourseContentPopover from "./CourseContentPopover";

interface UserFeedbackFormProps {
  stepId: number;
  substepTitle: string;
}

export default function UserFeedbackForm({ stepId, substepTitle }: UserFeedbackFormProps) {
  // État local pour le formulaire
  const [formData, setFormData] = useState({
    context: "",
    user_reaction: "",
    insights: "",
    unexpected: "",
    next_hypothesis: ""
  });

  // Gestionnaire de changement qui met à jour uniquement le champ modifié
  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handler pour quand les données sont sauvegardées
  const handleDataSaved = useCallback((data: any) => {
    // Ne mettre à jour l'état que si les données sont différentes
    // pour éviter des re-rendus en boucle
    if (JSON.stringify(data) !== JSON.stringify(formData)) {
      setFormData(data);
    }
  }, [formData]);

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="user_feedback_form"
      title="Retour utilisateur – test terrain"
      description="Notez ici le retour d'un utilisateur après avoir testé votre solution ou MVP. Objectif : extraire des insights et décider des suites."
      formData={formData}
      onDataSaved={handleDataSaved}
    >
      <div className="space-y-6">
        <div className="flex justify-end mb-2">
          <CourseContentPopover
            stepId={stepId}
            substepTitle={substepTitle}
            triggerText="Voir le cours"
            className="mb-2"
          />
        </div>
        
        <Card className="p-5">
          <Label htmlFor="context">Contexte du test</Label>
          <Textarea
            id="context"
            placeholder="Quel scénario de test ? (Ex : landing page, maquette, démonstration...)"
            className="min-h-[100px] mt-2"
            value={formData.context}
            onChange={(e) => handleChange("context", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label htmlFor="user_reaction">Réaction de l'utilisateur</Label>
          <Textarea
            id="user_reaction"
            placeholder="Qu'a-t-il/elle dit, fait, exprimé ?"
            className="min-h-[100px] mt-2"
            value={formData.user_reaction}
            onChange={(e) => handleChange("user_reaction", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label htmlFor="insights">Apprentissages clés / insights</Label>
          <Textarea
            id="insights"
            placeholder="Que retenez-vous de ce retour ?"
            className="min-h-[100px] mt-2"
            value={formData.insights}
            onChange={(e) => handleChange("insights", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label htmlFor="unexpected">Éléments inattendus</Label>
          <Textarea
            id="unexpected"
            placeholder="Quel retour ou comportement vous a surpris ?"
            className="min-h-[100px] mt-2"
            value={formData.unexpected}
            onChange={(e) => handleChange("unexpected", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label htmlFor="next_hypothesis">Nouvelle hypothèse à tester</Label>
          <Textarea
            id="next_hypothesis"
            placeholder="Que testerez-vous ensuite ?"
            className="min-h-[100px] mt-2"
            value={formData.next_hypothesis}
            onChange={(e) => handleChange("next_hypothesis", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
