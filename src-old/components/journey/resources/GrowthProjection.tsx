
import { useState } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import EnhancedExportPanel from "../resource-form/EnhancedExportPanel";

interface GrowthProjectionProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  key_milestones: string;
  expected_growth: string;
  team_scaling: string;
  product_scaling: string;
}

export default function GrowthProjection({ stepId, substepTitle }: GrowthProjectionProps) {
  const defaultValues: FormData = {
    key_milestones: "",
    expected_growth: "",
    team_scaling: "",
    product_scaling: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="growth_projection"
      title="Projection de croissance"
      description="Indiquez vos étapes clés, ambitions de croissance et structuration à venir."
      defaultValues={defaultValues}
      exportPanel={
        <EnhancedExportPanel 
          formData={defaultValues}
          resourceType="growth_projection"
          title="Projection de croissance"
        />
      }
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Jalons clés (milestones)</Label>
            <Textarea
              placeholder="Lancement produit, 100 clients, levée de fonds, recrutement CTO..."
              value={formData?.key_milestones || ""}
              onChange={(e) => handleFormChange("key_milestones", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Objectifs de croissance</Label>
            <Textarea
              placeholder="Nombre d'utilisateurs, revenus, clients B2B..."
              value={formData?.expected_growth || ""}
              onChange={(e) => handleFormChange("expected_growth", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Évolution de l'équipe</Label>
            <Textarea
              placeholder="Recrutements à venir, organisation, RH clés..."
              value={formData?.team_scaling || ""}
              onChange={(e) => handleFormChange("team_scaling", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Évolution produit / tech</Label>
            <Textarea
              placeholder="Fonctionnalités futures, scalabilité, R&D, tech stack..."
              value={formData?.product_scaling || ""}
              onChange={(e) => handleFormChange("product_scaling", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
