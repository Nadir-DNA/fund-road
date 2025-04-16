import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PaidOfferFeedbackProps {
  stepId: number;
  substepTitle: string;
}

export default function PaidOfferFeedback({ stepId, substepTitle }: PaidOfferFeedbackProps) {
  const [formData, setFormData] = useState({
    offer_tested: "",
    user_reaction: "",
    objections: "",
    perceived_value: "",
    pricing_feedback: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="paid_offer_feedback"
      title="Retour sur offre payante"
      description="Collectez les retours d’utilisateurs sur une offre tarifée testée pour ajuster votre modèle économique."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Offre testée</Label>
          <Textarea
            placeholder="Description de l’offre proposée à vos utilisateurs"
            className="min-h-[100px]"
            value={formData.offer_tested}
            onChange={(e) => handleChange("offer_tested", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Réaction générale</Label>
          <Textarea
            placeholder="Est-ce que l’utilisateur a compris, trouvé ça utile, exprimé un intérêt ?"
            className="min-h-[100px]"
            value={formData.user_reaction}
            onChange={(e) => handleChange("user_reaction", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Objections émises</Label>
          <Textarea
            placeholder="Qu’est-ce qui a pu bloquer ?"
            className="min-h-[100px]"
            value={formData.objections}
            onChange={(e) => handleChange("objections", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Valeur perçue</Label>
          <Textarea
            placeholder="Comment l’utilisateur perçoit l’intérêt ou la valeur ajoutée ?"
            className="min-h-[100px]"
            value={formData.perceived_value}
            onChange={(e) => handleChange("perceived_value", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Feedback sur le prix</Label>
          <Textarea
            placeholder="Est-ce que le prix semblait justifié, trop élevé, trop
