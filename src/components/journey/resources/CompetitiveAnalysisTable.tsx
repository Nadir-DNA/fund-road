
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CompetitiveAnalysisTableProps {
  stepId: number;
  substepTitle: string;
}

interface Competitor {
  name: string;
  offer: string;
  positioning: string;
  price_level: string;
  weaknesses: string;
}

export default function CompetitiveAnalysisTable({ stepId, substepTitle }: CompetitiveAnalysisTableProps) {
  const defaultValues: Competitor[] = [
    { name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="competitive_analysis"
      title="Analyse concurrentielle"
      description="Comparez les principaux acteurs du marché pour faire émerger votre différenciation."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: Competitor[]; handleFormChange: (field: string, value: any) => void }) => {
        const handleFieldChange = (index: number, field: keyof Competitor, value: string) => {
          const updated = [...(formData || defaultValues)];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("competitors", updated);
        };

        const handleAddRow = () => {
          const updated = [...(formData || defaultValues), { name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }];
          handleFormChange("competitors", updated);
        };

        const handleRemoveRow = (index: number) => {
          if ((formData || defaultValues).length <= 1) return;
          const updated = [...(formData || defaultValues)];
          updated.splice(index, 1);
          handleFormChange("competitors", updated);
        };

        const competitors = formData || defaultValues;

        return (
          <div className="space-y-4">
            {Array.isArray(competitors) ? (
              competitors.map((competitor, index) => (
                <Card key={index} className="p-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom du concurrent</Label>
                      <Input
                        placeholder="Ex: Notion, Excel, etc."
                        value={competitor.name}
                        onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Offre / Produit</Label>
                      <Input
                        placeholder="Ce qu'il propose concrètement"
                        value={competitor.offer}
                        onChange={(e) => handleFieldChange(index, "offer", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Positionnement</Label>
                      <Input
                        placeholder="Segment visé, angle marketing, niche"
                        value={competitor.positioning}
                        onChange={(e) => handleFieldChange(index, "positioning", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Niveau de prix</Label>
                      <Input
                        placeholder="Ex: gratuit / freemium / premium / $$$"
                        value={competitor.price_level}
                        onChange={(e) => handleFieldChange(index, "price_level", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Points faibles perçus</Label>
                      <Input
                        placeholder="Limites, critiques des utilisateurs..."
                        value={competitor.weaknesses}
                        onChange={(e) => handleFieldChange(index, "weaknesses", e.target.value)}
                      />
                    </div>
                  </div>
                  {competitors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 text-red-500"
                      onClick={() => handleRemoveRow(index)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <div className="p-4 text-center">
                <p>Erreur: format de données incorrect</p>
                <Button 
                  className="mt-4" 
                  onClick={() => handleFormChange("competitors", defaultValues)}
                >
                  Réinitialiser
                </Button>
              </div>
            )}

            <Button type="button" onClick={handleAddRow} className="mt-4">
              ➕ Ajouter un concurrent
            </Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
