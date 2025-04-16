import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PitchDeckBuilderProps {
  stepId: number;
  substepTitle: string;
}

export default function PitchDeckBuilder({ stepId, substepTitle }: PitchDeckBuilderProps) {
  const [formData, setFormData] = useState({
    title_slide: "",
    problem: "",
    solution: "",
    market: "",
    product: "",
    business_model: "",
    traction: "",
    go_to_market: "",
    competition: "",
    team: "",
    financials: "",
    ask: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="pitch_deck_builder"
      title="Éditeur du pitch investisseur"
      description="Complétez chaque slide de votre pitch deck en suivant une structure standard."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">

        <Card className="p-5"><Label>Slide 1 – Titre & tagline</Label>
          <Textarea
            placeholder="Nom du projet, baseline percutante"
            value={formData.title_slide}
            onChange={(e) => handleChange("title_slide", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 2 – Problème</Label>
          <Textarea
            placeholder="Quel problème concret, douloureux et fréquent vous attaquez ?"
            value={formData.problem}
            onChange={(e) => handleChange("problem", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 3 – Solution</Label>
          <Textarea
            placeholder="Quelle solution vous proposez et pourquoi elle est différenciante"
            value={formData.solution}
            onChange={(e) => handleChange("solution", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 4 – Marché</Label>
          <Textarea
            placeholder="TAM / SAM / SOM ou segments cibles"
            value={formData.market}
            onChange={(e) => handleChange("market", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 5 – Produit</Label>
          <Textarea
            placeholder="Démo rapide du produit / capture / proto"
            value={formData.product}
            onChange={(e) => handleChange("product", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 6 – Business model</Label>
          <Textarea
            placeholder="Comment vous gagnez de l’argent, pricing, récurrence"
            value={formData.business_model}
            onChange={(e) => handleChange("business_model", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 7 – Traction</Label>
          <Textarea
            placeholder="Clients, MRR, usage, presse, milestones atteints"
            value={formData.traction}
            onChange={(e) => handleChange("traction", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 8 – Go-to-market</Label>
          <Textarea
            placeholder="Comment vous allez atteindre votre marché (canaux, stratégies)"
            value={formData.go_to_market}
            onChange={(e) => handleChange("go_to_market", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 9 – Concurrence</Label>
          <Textarea
            placeholder="Vos compétiteurs directs et indirects, et votre différenciation"
            value={formData.competition}
            onChange={(e) => handleChange("competition", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 10 – Équipe</Label>
          <Textarea
            placeholder="Fondateurs, expertise clé, complémentarité"
            value={formData.team}
            onChange={(e) => handleChange("team", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 11 – Projections financières</Label>
          <Textarea
            placeholder="Prévisions CA / EBITDA / nombre de clients, etc."
            value={formData.financials}
            onChange={(e) => handleChange("financials", e.target.value)}
          />
        </Card>

        <Card className="p-5"><Label>Slide 12 – Besoins (Ask)</Label>
          <Textarea
            placeholder="Combien vous cherchez, pour quoi faire, avec quel plan"
            value={formData.ask}
            onChange={(e) => handleChange("ask", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
