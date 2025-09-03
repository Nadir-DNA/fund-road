
import { useState, useEffect } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CustomerBehaviorNotesProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  typical_behavior: string;
  channels_used: string;
  decision_criteria: string;
  loyalty_drivers: string;
  blocking_factors: string;
}

export default function CustomerBehaviorNotes({ stepId, substepTitle }: CustomerBehaviorNotesProps) {
  const defaultValues: FormData = {
    typical_behavior: "",
    channels_used: "",
    decision_criteria: "",
    loyalty_drivers: "",
    blocking_factors: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="customer_behavior_notes"
      title="Analyse comportementale client"
      description="Comprenez comment vos clients cibles se comportent aujourd'hui face à leur problème ou besoin."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Comportement type actuel</Label>
            <Textarea
              placeholder="Comment gèrent-ils actuellement le problème ?"
              className="min-h-[100px]"
              value={formData?.typical_behavior || ""}
              onChange={(e) => {
                console.log('CustomerBehaviorNotes: Mise à jour typical_behavior:', e.target.value);
                handleFormChange("typical_behavior", e.target.value);
              }}
            />
          </Card>
          
          <Card className="p-5">
            <Label>Canaux qu'ils utilisent</Label>
            <Textarea
              placeholder="Sites web, forums, réseaux sociaux, bouche à oreille, etc."
              className="min-h-[100px]"
              value={formData?.channels_used || ""}
              onChange={(e) => {
                console.log('CustomerBehaviorNotes: Mise à jour channels_used:', e.target.value);
                handleFormChange("channels_used", e.target.value);
              }}
            />
          </Card>
          
          <Card className="p-5">
            <Label>Critères de décision</Label>
            <Textarea
              placeholder="Sur quoi basent-ils leur choix ? Prix ? Simplicité ? Réputation ?"
              className="min-h-[100px]"
              value={formData?.decision_criteria || ""}
              onChange={(e) => {
                console.log('CustomerBehaviorNotes: Mise à jour decision_criteria:', e.target.value);
                handleFormChange("decision_criteria", e.target.value);
              }}
            />
          </Card>
          
          <Card className="p-5">
            <Label>Facteurs de fidélité</Label>
            <Textarea
              placeholder="Qu'est-ce qui les ferait rester sur une solution ?"
              className="min-h-[100px]"
              value={formData?.loyalty_drivers || ""}
              onChange={(e) => {
                console.log('CustomerBehaviorNotes: Mise à jour loyalty_drivers:', e.target.value);
                handleFormChange("loyalty_drivers", e.target.value);
              }}
            />
          </Card>
          
          <Card className="p-5">
            <Label>Freins ou blocages</Label>
            <Textarea
              placeholder="Quels obstacles les empêchent de changer ?"
              className="min-h-[100px]"
              value={formData?.blocking_factors || ""}
              onChange={(e) => {
                console.log('CustomerBehaviorNotes: Mise à jour blocking_factors:', e.target.value);
                handleFormChange("blocking_factors", e.target.value);
              }}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
