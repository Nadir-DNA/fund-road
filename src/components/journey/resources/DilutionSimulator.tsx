
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface DilutionSimulatorProps {
  stepId: number;
  substepTitle: string;
}

export default function DilutionSimulator({ stepId, substepTitle }: DilutionSimulatorProps) {
  const [formData, setFormData] = useState({
    current_valuation: "",
    funding_asked: "",
    post_money_valuation: "",
    investor_equity: ""
  });

  const handleChange = (field: string, value: string) => {
    const nextState = { ...formData, [field]: value };

    const valuation = parseFloat(nextState.post_money_valuation || "0");
    const asked = parseFloat(nextState.funding_asked || "0");

    const equity = valuation && asked ? ((asked / valuation) * 100).toFixed(2) + " %" : "";

    nextState.investor_equity = equity;

    setFormData(nextState);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="dilution_simulator"
      title="Simulateur de dilution"
      description="Estimez la part du capital que prendrait un investisseur après votre levée."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <Label>Valorisation post-money</Label>
          <Input
            placeholder="Ex : 1 000 000 €"
            value={formData.post_money_valuation}
            onChange={(e) => handleChange("post_money_valuation", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Montant levé</Label>
          <Input
            placeholder="Ex : 200 000 €"
            value={formData.funding_asked}
            onChange={(e) => handleChange("funding_asked", e.target.value)}
          />
        </Card>

        <Card className="p-5 md:col-span-2">
          <Label>Part de l'investisseur estimée</Label>
          <Input
            readOnly
            value={formData.investor_equity}
            placeholder="% automatiquement calculé"
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
