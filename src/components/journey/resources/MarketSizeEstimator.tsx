import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MarketSizeEstimatorProps {
  stepId: number;
  substepTitle: string;
}

export default function MarketSizeEstimator({ stepId, substepTitle }: MarketSizeEstimatorProps) {
  const [formData, setFormData] = useState({
    tam_value: "",
    tam_description: "",
    sam_value: "",
    sam_description: "",
    som_value: "",
    som_description: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="market_size_estimator"
      title="Estimation du marché (TAM / SAM / SOM)"
      description="Estimez le marché global, le marché accessible, et votre part atteignable. Ces données sont clés pour valider une opportunité."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* TAM */}
        <Card className="p-4 border-primary/20 bg-primary/5">
          <Label className="block font-medium mb-2">TAM – Marché total</Label>
          <Input
            type="text"
            placeholder="Ex: 2 000 000 €"
            value={formData.tam_value}
            onChange={(e) => handleChange("tam_value", e.target.value)}
          />
          <Textarea
            className="mt-3"
            placeholder="Qui sont tous les utilisateurs ou clients concernés par la problématique au niveau global ?"
            value={formData.tam_description}
            onChange={(e) => handleChange("tam_description", e.target.value)}
          />
        </Card>

        {/* SAM */}
        <Card className="p-4 border-blue-200/20 bg-blue-50/10">
          <Label className="block font-medium mb-2">SAM – Marché accessible</Label>
          <Input
            type="text"
            placeholder="Ex: 800 000 €"
            value={formData.sam_value}
            onChange={(e) => handleChange("sam_value", e.target.value)}
          />
          <Textarea
            className="mt-3"
            placeholder="Quel segment du marché total pouvez-vous raisonnablement adresser avec votre offre ?"
            value={formData.sam_description}
            onChange={(e) => handleChange("sam_description", e.target.value)}
          />
        </Card>

        {/* SOM */}
        <Card className="p-4 border-emerald-200/20 bg-emerald-50/10">
          <Label className="block font-medium mb-2">SOM – Marché atteignable</Label>
          <Input
            type="text"
            placeholder="Ex: 120 000 €"
            value={formData.som_value}
            onChange={(e) => handleChange("som_value", e.target.value)}
          />
          <Textarea
            className="mt-3"
            placeholder="Quelle part pouvez-vous atteindre à court terme (1 à 3 ans) avec vos ressources actuelles ?"
            value={formData.som_description}
            onChange={(e) => handleChange("som_description", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
