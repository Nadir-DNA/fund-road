
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface BusinessPlanEditorProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  executive_summary: string;
  problem_opportunity: string;
  solution_product: string;
  market_analysis: string;
  business_model: string;
  go_to_market: string;
  competition: string;
  team: string;
  financials: string;
  roadmap: string;
}

export default function BusinessPlanEditor({ stepId, substepTitle }: BusinessPlanEditorProps) {
  const defaultValues: FormData = {
    executive_summary: "",
    problem_opportunity: "",
    solution_product: "",
    market_analysis: "",
    business_model: "",
    go_to_market: "",
    competition: "",
    team: "",
    financials: "",
    roadmap: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="business_plan_editor"
      title="Éditeur guidé du Business Plan"
      description="Complétez les sections clés de votre BP avec des exemples concrets pour chaque partie."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Résumé exécutif</Label>
            <Textarea
              placeholder="Pitch rapide du projet, en 5 lignes."
              value={formData?.executive_summary || ""}
              onChange={(e) => handleFormChange("executive_summary", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Problème et opportunité</Label>
            <Textarea
              placeholder="Quel problème vous ciblez, pourquoi maintenant ?"
              value={formData?.problem_opportunity || ""}
              onChange={(e) => handleFormChange("problem_opportunity", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Solution / Produit</Label>
            <Textarea
              placeholder="Décrivez votre solution et sa valeur ajoutée principale."
              value={formData?.solution_product || ""}
              onChange={(e) => handleFormChange("solution_product", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Analyse de marché</Label>
            <Textarea
              placeholder="TAM / SAM / SOM, comportement client, tendances..."
              value={formData?.market_analysis || ""}
              onChange={(e) => handleFormChange("market_analysis", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Modèle économique</Label>
            <Textarea
              placeholder="Comment vous générez des revenus, pricing, logique de marge."
              value={formData?.business_model || ""}
              onChange={(e) => handleFormChange("business_model", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Go-To-Market</Label>
            <Textarea
              placeholder="Vos premiers canaux d'acquisition, stratégie de lancement."
              value={formData?.go_to_market || ""}
              onChange={(e) => handleFormChange("go_to_market", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Concurrence</Label>
            <Textarea
              placeholder="Qui existe déjà, quelles alternatives, comment vous vous différenciez ?"
              value={formData?.competition || ""}
              onChange={(e) => handleFormChange("competition", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Équipe</Label>
            <Textarea
              placeholder="Qui porte le projet, compétences, historique de collaboration."
              value={formData?.team || ""}
              onChange={(e) => handleFormChange("team", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Prévisions financières</Label>
            <Textarea
              placeholder="Chiffres clés, projections 1-3 ans, rentabilité visée."
              value={formData?.financials || ""}
              onChange={(e) => handleFormChange("financials", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Roadmap</Label>
            <Textarea
              placeholder="Jalons à venir, version bêta, croissance, levée, internationalisation..."
              value={formData?.roadmap || ""}
              onChange={(e) => handleFormChange("roadmap", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
