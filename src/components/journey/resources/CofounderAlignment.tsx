
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CofounderAlignmentProps {
  stepId: number;
  substepTitle: string;
}

export default function CofounderAlignment({ stepId, substepTitle }: CofounderAlignmentProps) {
  const [formData, setFormData] = useState({
    vision: "",
    values: "",
    ambition: "",
    scenario_exit: "",
    decision_rules: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cofounder_alignment"
      title="Matrice alignement cofondateurs"
      description="Cernez les points d'alignement ou de tension potentiels entre associés."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5">
          <Label>Vision long terme</Label>
          <Textarea
            placeholder="Ex : devenir leader en Europe, rester une entreprise indépendante, etc."
            value={formData.vision}
            onChange={(e) => handleChange("vision", e.target.value)}
          />
        </Card>
        <Card className="p-5">
          <Label>Valeurs fondamentales</Label>
          <Textarea
            placeholder="Ex : transparence, rigueur, ambition, entraide..."
            value={formData.values}
            onChange={(e) => handleChange("values", e.target.value)}
          />
        </Card>
        <Card className="p-5">
          <Label>Objectifs personnels</Label>
          <Textarea
            placeholder="Qu'attendez-vous personnellement du projet ?"
            value={formData.ambition}
            onChange={(e) => handleChange("ambition", e.target.value)}
          />
        </Card>
        <Card className="p-5">
          <Label>Scénario de sortie</Label>
          <Textarea
            placeholder="Que se passerait-il si quelqu'un voulait partir ?"
            value={formData.scenario_exit}
            onChange={(e) => handleChange("scenario_exit", e.target.value)}
          />
        </Card>
        <Card className="p-5">
          <Label>Règles de décision collective</Label>
          <Textarea
            placeholder="Comment gérez-vous les désaccords ?"
            value={formData.decision_rules}
            onChange={(e) => handleChange("decision_rules", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
