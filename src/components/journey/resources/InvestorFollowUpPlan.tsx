import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactEntry {
  investor: string;
  date_contacted: string;
  status: string;
  next_action: string;
}

interface InvestorFollowUpPlanProps {
  stepId: number;
  substepTitle: string;
}

export default function InvestorFollowUpPlan({ stepId, substepTitle }: InvestorFollowUpPlanProps) {
  const [formData, setFormData] = useState<ContactEntry[]>([
    { investor: "", date_contacted: "", status: "", next_action: "" }
  ]);

  const handleChange = (index: number, field: keyof ContactEntry, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addRow = () => {
    setFormData(prev => [...prev, { investor: "", date_contacted: "", status: "", next_action: "" }]);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="investor_followup_plan"
      title="Suivi des contacts investisseurs"
      description="Suivez vos échanges et vos prochaines relances avec les investisseurs."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((entry, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div>
              <Label>Nom de l’investisseur</Label>
              <Input
                placeholder="Nom ou fond"
                value={entry.investor}
                onChange={(e) => handleChange(index, "investor", e.target.value)}
              />
            </div>
            <div>
              <Label>Date du premier contact</Label>
              <Input
                placeholder="JJ/MM/AAAA"
                value={entry.date_contacted}
                onChange={(e) => handleChange(index, "date_contacted", e.target.value)}
              />
            </div>
            <div>
              <Label>Statut</Label>
              <Input
                placeholder="Ex : Contacté, En cours, Refusé, Call planifié"
                value={entry.status}
                onChange={(e) => handleChange(index, "status", e.target.value)}
              />
            </div>
            <div>
              <Label>Prochaine action</Label>
              <Input
                placeholder="Ex : Renvoyer BP, relancer semaine prochaine"
                value={entry.next_action}
                onChange={(e) => handleChange(index, "next_action", e.target.value)}
              />
            </div>
          </Card>
        ))}
        <Button onClick={addRow} className="mt-2">➕ Ajouter un contact</Button>
      </div>
    </ResourceForm>
  );
}
