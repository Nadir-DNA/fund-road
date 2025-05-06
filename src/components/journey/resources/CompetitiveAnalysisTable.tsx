
import { useState, useEffect } from "react";
import ResourceForm from "../ResourceForm";
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
  const [formData, setFormData] = useState<Competitor[]>([
    { name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }
  ]);

  const handleChange = (index: number, field: keyof Competitor, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleAddRow = () => {
    setFormData(prev => [...prev, { name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
  };

  // Handle the case when formData comes from the server and might not be an array
  const handleDataSaved = (data: any) => {
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : 
      (data && typeof data === 'object') ? [data] : 
      [{ name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }];
    
    console.log("Data received in CompetitiveAnalysisTable:", dataArray);
    setFormData(dataArray);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="competitive_analysis"
      title="Analyse concurrentielle"
      description="Comparez les principaux acteurs du marché pour faire émerger votre différenciation."
      formData={formData} // Changed from defaultValues to formData to match ResourceForm's expected props
      onDataSaved={handleDataSaved}
    >
      <div className="space-y-4">
        {Array.isArray(formData) ? (
          formData.map((competitor, index) => (
            <Card key={index} className="p-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom du concurrent</Label>
                  <Input
                    placeholder="Ex: Notion, Excel, etc."
                    value={competitor.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Offre / Produit</Label>
                  <Input
                    placeholder="Ce qu'il propose concrètement"
                    value={competitor.offer}
                    onChange={(e) => handleChange(index, "offer", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Positionnement</Label>
                  <Input
                    placeholder="Segment visé, angle marketing, niche"
                    value={competitor.positioning}
                    onChange={(e) => handleChange(index, "positioning", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Niveau de prix</Label>
                  <Input
                    placeholder="Ex: gratuit / freemium / premium / $$$"
                    value={competitor.price_level}
                    onChange={(e) => handleChange(index, "price_level", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Points faibles perçus</Label>
                  <Input
                    placeholder="Limites, critiques des utilisateurs..."
                    value={competitor.weaknesses}
                    onChange={(e) => handleChange(index, "weaknesses", e.target.value)}
                  />
                </div>
              </div>
              {index > 0 && (
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
            <p>Chargement des données...</p>
          </div>
        )}

        <Button type="button" onClick={handleAddRow} className="mt-4">
          ➕ Ajouter un concurrent
        </Button>
      </div>
    </ResourceForm>
  );
}
