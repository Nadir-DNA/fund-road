import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ProblemSolutionCanvasProps {
  stepId: number;
  substepTitle: string;
}

export default function ProblemSolutionCanvas({ stepId, substepTitle }: ProblemSolutionCanvasProps) {
  const [formData, setFormData] = useState({
    user_problem: "",
    root_cause: "",
    current_alternative: "",
    proposed_solution: "",
    key_differentiator: ""
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
      resourceType="problem_solution_canvas"
      title="Canvas Problème / Solution"
      description="Formulez clairement le problème principal rencontré par votre cible, et la solution que vous proposez."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5 bg-red-50/10 border-red-200/20">
          <Label>Problème utilisateur principal</Label>
          <Textarea
            placeholder="Quel est le principal irritant ou blocage vécu par vos utilisateurs ?"
            className="min-h-[120px]"
            value={formData.user_problem}
            onChange={(e) => handleChange("user_problem", e.target.value)}
          />
        </Card>

        <Card className="p-5 bg-yellow-50/10 border-yellow-200/20">
          <Label>Cause racine identifiée</Label>
          <Textarea
            placeholder="Pourquoi ce problème existe-t-il ? (structurel, contextuel, etc.)"
            className="min-h-[100px]"
            value={formData.root_cause}
            onChange={(e) => handleChange("root_cause", e.target.value)}
          />
        </Card>

        <Card className="p-5 bg-blue-50/10 border-blue-200/20">
          <Label>Solution actuelle (alternative)</Label>
          <Textarea
            placeholder="Comment les utilisateurs gèrent-ils ce problème aujourd’hui ?"
            className="min-h-[100px]"
            value={formData.current_alternative}
            onChange={(e) => handleChange("current_alternative", e.target.value)}
          />
        </Card>

        <Card className="p-5 bg-green-50/10 border-green-200/20">
          <Label>Solution que vous proposez</Label>
          <Textarea
            placeholder="Quel est le cœur de votre proposition ?"
            className="min-h-[120px]"
            value={formData.proposed_solution}
            onChange={(e) => handleChange("proposed_solution", e.target.value)}
          />
        </Card>

        <Card className="p-5 bg-emerald-50/10 border-emerald-200/20">
          <Label>Différenciateur clé</Label>
          <Textarea
            placeholder="Pourquoi votre solution est-elle meilleure ou différente ?"
            className="min-h-[100px]"
            value={formData.key_differentiator}
            onChange={(e) => handleChange("key_differentiator", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
