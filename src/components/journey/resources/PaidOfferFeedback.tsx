
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface PaidOfferFeedbackProps {
  stepId: number;
  substepTitle: string;
}

export default function PaidOfferFeedback({ stepId, substepTitle }: PaidOfferFeedbackProps) {
  const [formData, setFormData] = useState({
    value_perception: 0,
    price_appropriateness: 0,
    pricing_feedback: "",
    user_quote: "",
    improvement_suggestions: ""
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="paid_offer_feedback"
      title="Retours sur offre payante"
      description="Collectez les retours des premiers clients payants pour améliorer votre offre."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5">
          <Label className="mb-2 block">Perception de la valeur (1-10)</Label>
          <div className="py-4">
            <Slider 
              value={[formData.value_perception]} 
              min={0} 
              max={10} 
              step={1}
              onValueChange={val => handleChange("value_perception", val[0])}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Faible</span>
              <span>Score: {formData.value_perception}</span>
              <span>Élevée</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <Label className="mb-2 block">Adéquation du prix (1-10)</Label>
          <div className="py-4">
            <Slider 
              value={[formData.price_appropriateness]} 
              min={0} 
              max={10} 
              step={1}
              onValueChange={val => handleChange("price_appropriateness", val[0])}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Trop bas</span>
              <span>Score: {formData.price_appropriateness}</span>
              <span>Trop élevé</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <Label>Retours sur le prix</Label>
          <Textarea
            placeholder="Que pensent les clients du prix par rapport à la valeur perçue ?"
            value={formData.pricing_feedback}
            onChange={(e) => handleChange("pricing_feedback", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Citation client marquante</Label>
          <Textarea
            placeholder="Une citation client particulièrement révélatrice..."
            value={formData.user_quote}
            onChange={(e) => handleChange("user_quote", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Suggestions d'amélioration</Label>
          <Textarea
            placeholder="Quelles améliorations les clients aimeraient voir ?"
            value={formData.improvement_suggestions}
            onChange={(e) => handleChange("improvement_suggestions", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
