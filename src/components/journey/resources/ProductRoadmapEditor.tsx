
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface RoadmapEntry {
  period: string;
  goals: string;
  features: string;
  kpis: string;
}

interface ProductRoadmapEditorProps {
  stepId: number;
  substepTitle: string;
}

export default function ProductRoadmapEditor({ stepId, substepTitle }: ProductRoadmapEditorProps) {
  const defaultValues: RoadmapEntry[] = [
    { period: "Mois 1", goals: "", features: "", kpis: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="product_roadmap"
      title="Feuille de route produit"
      description="Planifiez le développement de votre produit sur 6 à 12 mois : objectifs, fonctionnalités, KPIs par phase."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: RoadmapEntry[]; handleFormChange: (field: string, value: any) => void }) => {
        const entries = Array.isArray(formData) ? formData : defaultValues;

        const handleChange = (index: number, field: keyof RoadmapEntry, value: string) => {
          const updated = [...entries];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("entries", updated);
        };

        const addPeriod = () => {
          const updated = [...entries, { period: `Mois ${entries.length + 1}`, goals: "", features: "", kpis: "" }];
          handleFormChange("entries", updated);
        };

        const removePeriod = (index: number) => {
          if (entries.length > 1) {
            const updated = [...entries];
            updated.splice(index, 1);
            handleFormChange("entries", updated);
          }
        };

        return (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={index} className="p-4 relative space-y-3">
                <div>
                  <Label>Période / Sprint</Label>
                  <Input
                    value={entry.period}
                    onChange={(e) => handleChange(index, "period", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Objectifs de la période</Label>
                  <Textarea
                    placeholder="Ex : Valider le MVP, lancer la version bêta..."
                    value={entry.goals}
                    onChange={(e) => handleChange(index, "goals", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fonctionnalités ou livrables</Label>
                  <Textarea
                    placeholder="Ex : page d'onboarding, dashboard, API de paiement"
                    value={entry.features}
                    onChange={(e) => handleChange(index, "features", e.target.value)}
                  />
                </div>
                <div>
                  <Label>KPIs / Critères de succès</Label>
                  <Textarea
                    placeholder="Ex : 200 utilisateurs, 50% activation, 20 feedbacks"
                    value={entry.kpis}
                    onChange={(e) => handleChange(index, "kpis", e.target.value)}
                  />
                </div>

                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 text-red-500"
                    onClick={() => removePeriod(index)}
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </Card>
            ))}
            <Button type="button" onClick={addPeriod} className="mt-4">
              ➕ Ajouter une période
            </Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
