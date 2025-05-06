
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
    if (formData.length <= 1) {
      // Don't remove the last row
      return;
    }
    
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
  };

  // Handle incoming data safely
  const handleDataSaved = (data: any) => {
    console.log("CompetitiveAnalysisTable - Data received:", data);
    
    // Initialize with default value for empty data
    const defaultCompetitor = { name: "", offer: "", positioning: "", price_level: "", weaknesses: "" };
    
    // Handle null or undefined data
    if (!data) {
      console.log("No data received, using default competitor structure");
      setFormData([defaultCompetitor]);
      return;
    }
    
    try {
      // Handle array data
      if (Array.isArray(data)) {
        console.log("Data is an array with length:", data.length);
        // Use received array if it has items, otherwise use default
        setFormData(data.length > 0 ? data : [defaultCompetitor]);
        return;
      }
      
      // Handle single object data - wrap in array
      if (typeof data === 'object') {
        console.log("Data is an object, converting to array");
        setFormData([data]);
        return;
      }
      
      // Handle string data (possibly JSON)
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            console.log("Parsed string data into array");
            setFormData(parsed.length > 0 ? parsed : [defaultCompetitor]);
          } else if (typeof parsed === 'object') {
            console.log("Parsed string data into object, converting to array");
            setFormData([parsed]);
          } else {
            console.log("Parsed string data is not valid for competitors");
            setFormData([defaultCompetitor]);
          }
          return;
        } catch (e) {
          console.error("Failed to parse string data:", e);
          setFormData([defaultCompetitor]);
          return;
        }
      }
      
      // Fallback for unknown data formats
      console.log("Unrecognized data format, using default");
      setFormData([defaultCompetitor]);
      
    } catch (error) {
      console.error("Error processing competitor data:", error);
      setFormData([defaultCompetitor]);
    }
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="competitive_analysis"
      title="Analyse concurrentielle"
      description="Comparez les principaux acteurs du marché pour faire émerger votre différenciation."
      formData={formData}
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
              {formData.length > 1 && (
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
              onClick={() => setFormData([{ name: "", offer: "", positioning: "", price_level: "", weaknesses: "" }])}
            >
              Réinitialiser
            </Button>
          </div>
        )}

        <Button type="button" onClick={handleAddRow} className="mt-4">
          ➕ Ajouter un concurrent
        </Button>
      </div>
    </ResourceForm>
  );
}
