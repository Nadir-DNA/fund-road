
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CustomerBehaviorNotesProps {
  stepId: number;
  substepTitle: string;
}

export default function CustomerBehaviorNotes({ stepId, substepTitle }: CustomerBehaviorNotesProps) {
  const [formData, setFormData] = useState({
    typical_behavior: "",
    channels_used: "",
    decision_criteria: "",
    loyalty_drivers: "",
    blocking_factors: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="customer_behavior_notes"
      title="Analyse comportementale client"
      description="Comprenez comment vos clients cibles se comportent aujourd'hui face à leur problème ou besoin."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Comportement type actuel</Label>
          <Textarea
            placeholder="Comment gèrent-ils actuellement le problème ?"
            className="min-h-[100px]"
            value={formData.typical_behavior}
            onChange={(e) => handleChange("typical_behavior", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Canaux qu'ils utilisent</Label>
          <Textarea
            placeholder="Sites web, forums, réseaux sociaux, bouche à oreille, etc."
            className="min-h-[100px]"
            value={formData.channels_used}
            onChange={(e) => handleChange("channels_used", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Critères de décision</Label>
          <Textarea
            placeholder="Sur quoi basent-ils leur choix ? Prix ? Simplicité ? Réputation ?"
            className="min-h-[100px]"
            value={formData.decision_criteria}
            onChange={(e) => handleChange("decision_criteria", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Facteurs de fidélité</Label>
          <Textarea
            placeholder="Qu'est-ce qui les ferait rester sur une solution ?"
            className="min-h-[100px]"
            value={formData.loyalty_drivers}
            onChange={(e) => handleChange("loyalty_drivers", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Freins ou blocages</Label>
          <Textarea
            placeholder="Quels obstacles les empêchent de changer ?"
            className="min-h-[100px]"
            value={formData.blocking_factors}
            onChange={(e) => handleChange("blocking_factors", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
