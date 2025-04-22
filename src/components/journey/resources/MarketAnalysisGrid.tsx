import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MarketAnalysisGridProps {
  stepId: number;
  substepTitle: string;
}

export default function MarketAnalysisGrid({ stepId, substepTitle }: MarketAnalysisGridProps) {
  const [formData, setFormData] = useState({
    market_trends: "",
    market_size: "",
    market_growth: "",
    entry_barriers: "",
    regulations: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="market_analysis_grid"
      title="Grille d'analyse de marché"
      description="Structurez votre compréhension des forces, tendances et contraintes de votre marché cible."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Tendances du marché</Label>
          <Textarea
            placeholder="Ex : digitalisation, consommation responsable, IA, etc."
            className="min-h-[100px]"
            value={formData.market_trends}
            onChange={(e) => handleChange("market_trends", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Taille du marché</Label>
          <Textarea
            placeholder="Valeur estimée du marché visé (en € ou nombre d’acteurs)"
            className="min-h-[100px]"
            value={formData.market_size}
            onChange={(e) => handleChange("market_size", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Croissance du marché</Label>
          <Textarea
            placeholder="Marché émergent, stable ou en déclin ?"
            className="min-h-[100px]"
            value={formData.market_growth}
            onChange={(e) => handleChange("market_growth", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Barrières à l’entrée</Label>
          <Textarea
            placeholder="Ex : brevets, capital initial, réputation, technicité"
            className="min-h-[100px]"
            value={formData.entry_barriers}
            onChange={(e) => handleChange("entry_barriers", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Contraintes réglementaires</Label>
          <Textarea
            placeholder="Normes, lois sectorielles, obligations légales spécifiques"
            className="min-h-[100px]"
            value={formData.regulations}
            onChange={(e) => handleChange("regulations", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
