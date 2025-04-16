import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Feature {
  name: string;
  impact: string;
  effort: string;
  keep_for_mvp: boolean;
}

interface FeaturePrioritizationMatrixProps {
  stepId: number;
  substepTitle: string;
}

export default function FeaturePrioritizationMatrix({ stepId, substepTitle }: FeaturePrioritizationMatrixProps) {
  const [formData, setFormData] = useState<Feature[]>([
    { name: "", impact: "", effort: "", keep_for_mvp: true }
  ]);

  const handleChange = (index: number, field: keyof Feature, value: string | boolean) => {
    const updated = [...formData];
    updated[index][field] = value as never;
    setFormData(updated);
  };

  const addRow = () => {
    setFormData(prev => [...prev, { name: "", impact: "", effort: "", keep_for_mvp: true }]);
  };

  const removeRow = (index: number) => {
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="feature_prioritization_matrix"
      title="Matrice Impact / Effort"
      description="Priorisez vos fonctionnalités MVP selon leur impact utilisateur et leur complexité de réalisation."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((feature, index) => (
          <Card key={index} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <Label>Fonctionnalité</Label>
              <Input
                placeholder="Ex : Connexion utilisateur"
                value={feature.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>
            <div>
              <Label>Impact utilisateur</Label>
              <Input
                placeholder="Ex : Élevé / Moyen / Faible"
                value={feature.impact}
                onChange={(e) => handleChange(index, "impact", e.target.value)}
              />
            </div>
            <div>
              <Label>Complexité / effort</Label>
              <Input
                placeholder="Ex : Faible / Moyen / Élevé"
                value={feature.effort}
                onChange={(e) => handleChange(index, "effort", e.target.value)}
              />
            </div>
            <div>
              <Label>Inclure dans MVP ?</Label>
              <input
                type="checkbox"
                checked={feature.keep_for_mvp}
                onChange={(e) => handleChange(index, "keep_for_mvp", e.target.checked)}
              />
            </div>
          </Card>
        ))}
        <button onClick={addRow} className="text-blue-600 text-sm mt-2 hover:underline">
          ➕ Ajouter une fonctionnalité
        </button>
      </div>
    </ResourceForm>
  );
}
