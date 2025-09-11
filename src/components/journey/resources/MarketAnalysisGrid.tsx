
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MarketAnalysisGridProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  market_trends: string;
  market_size: string;
  market_growth: string;
  entry_barriers: string;
  regulations: string;
}

export default function MarketAnalysisGrid({ stepId, substepTitle }: MarketAnalysisGridProps) {
  const defaultValues: FormData = {
    market_trends: "",
    market_size: "",
    market_growth: "",
    entry_barriers: "",
    regulations: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="market_analysis_grid"
      title="Grille d'analyse de marché"
      description="Structurez votre compréhension des forces, tendances et contraintes de votre marché cible."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Tendances du marché</Label>
            <Textarea
              placeholder="Ex : digitalisation, consommation responsable, IA, etc."
              className="min-h-[100px]"
              value={formData?.market_trends || ""}
              onChange={(e) => handleFormChange("market_trends", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Taille du marché</Label>
            <Textarea
              placeholder="Valeur estimée du marché visé (en € ou nombre d'acteurs)"
              className="min-h-[100px]"
              value={formData?.market_size || ""}
              onChange={(e) => handleFormChange("market_size", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Croissance du marché</Label>
            <Textarea
              placeholder="Marché émergent, stable ou en déclin ?"
              className="min-h-[100px]"
              value={formData?.market_growth || ""}
              onChange={(e) => handleFormChange("market_growth", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Barrières à l'entrée</Label>
            <Textarea
              placeholder="Ex : brevets, capital initial, réputation, technicité"
              className="min-h-[100px]"
              value={formData?.entry_barriers || ""}
              onChange={(e) => handleFormChange("entry_barriers", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Contraintes réglementaires</Label>
            <Textarea
              placeholder="Normes, lois sectorielles, obligations légales spécifiques"
              className="min-h-[100px]"
              value={formData?.regulations || ""}
              onChange={(e) => handleFormChange("regulations", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
