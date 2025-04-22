
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface GrowthProjectionProps {
  stepId: number;
  substepTitle: string;
}

export default function GrowthProjection({ stepId, substepTitle }: GrowthProjectionProps) {
  const [formData, setFormData] = useState({
    key_milestones: "",
    expected_growth: "",
    team_scaling: "",
    product_scaling: ""
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="growth_projection"
      title="Projection de croissance"
      description="Indiquez vos étapes clés, ambitions de croissance et structuration à venir."
      formData={formData}
      onDataSaved={data => setFormData(data)}
      exportPanel={
        <ExportPanel 
          formData={formData}
          resourceType="growth_projection"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Jalons clés (milestones)</Label>
          <Textarea
            placeholder="Lancement produit, 100 clients, levée de fonds, recrutement CTO..."
            value={formData.key_milestones}
            onChange={(e) => handleChange("key_milestones", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Objectifs de croissance</Label>
          <Textarea
            placeholder="Nombre d'utilisateurs, revenus, clients B2B..."
            value={formData.expected_growth}
            onChange={(e) => handleChange("expected_growth", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Évolution de l'équipe</Label>
          <Textarea
            placeholder="Recrutements à venir, organisation, RH clés..."
            value={formData.team_scaling}
            onChange={(e) => handleChange("team_scaling", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Évolution produit / tech</Label>
          <Textarea
            placeholder="Fonctionnalités futures, scalabilité, R&D, tech stack..."
            value={formData.product_scaling}
            onChange={(e) => handleChange("product_scaling", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
