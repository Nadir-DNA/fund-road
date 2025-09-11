
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const defaultValues: Feature[] = [
    { name: "", impact: "", effort: "", keep_for_mvp: true }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="feature_prioritization_matrix"
      title="Matrice Impact / Effort"
      description="Priorisez vos fonctionnalités MVP selon leur impact utilisateur et leur complexité de réalisation."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: Feature[]; handleFormChange: (field: string, value: any) => void }) => {
        const handleFieldChange = (index: number, field: keyof Feature, value: string | boolean) => {
          const updated = [...(formData || defaultValues)];
          updated[index] = { ...updated[index], [field]: value as never };
          handleFormChange("features", updated);
        };

        const addRow = () => {
          const updated = [...(formData || defaultValues), { name: "", impact: "", effort: "", keep_for_mvp: true }];
          handleFormChange("features", updated);
        };

        const features = formData || defaultValues;

        return (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <Label>Fonctionnalité</Label>
                  <Input
                    placeholder="Ex : Connexion utilisateur"
                    value={feature.name}
                    onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Impact utilisateur</Label>
                  <Input
                    placeholder="Ex : Élevé / Moyen / Faible"
                    value={feature.impact}
                    onChange={(e) => handleFieldChange(index, "impact", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Complexité / effort</Label>
                  <Input
                    placeholder="Ex : Faible / Moyen / Élevé"
                    value={feature.effort}
                    onChange={(e) => handleFieldChange(index, "effort", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Inclure dans MVP ?</Label>
                  <input
                    type="checkbox"
                    checked={feature.keep_for_mvp}
                    onChange={(e) => handleFieldChange(index, "keep_for_mvp", e.target.checked)}
                  />
                </div>
              </Card>
            ))}
            <Button onClick={addRow} className="mt-2">
              ➕ Ajouter une fonctionnalité
            </Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
