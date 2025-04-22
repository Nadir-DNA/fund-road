import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MvpSpecificationProps {
  stepId: number;
  substepTitle: string;
}

export default function MvpSpecification({ stepId, substepTitle }: MvpSpecificationProps) {
  const [formData, setFormData] = useState({
    mvp_goal: "",
    mvp_scope: "",
    user_flow: "",
    constraints: "",
    tools: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mvp_specification"
      title="Cahier des charges MVP"
      description="Spécifiez précisément ce que contiendra votre produit minimum viable et comment il sera construit."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Objectif principal du MVP</Label>
          <Textarea
            placeholder="Ce que vous voulez démontrer ou valider avec cette première version"
            className="min-h-[100px]"
            value={formData.mvp_goal}
            onChange={(e) => handleChange("mvp_goal", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Périmètre fonctionnel</Label>
          <Textarea
            placeholder="Quelles sont les fonctionnalités couvertes dans ce MVP ?"
            className="min-h-[100px]"
            value={formData.mvp_scope}
            onChange={(e) => handleChange("mvp_scope", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Parcours utilisateur</Label>
          <Textarea
            placeholder="À quoi ressemble l’expérience utilisateur du MVP ?"
            className="min-h-[100px]"
            value={formData.user_flow}
            onChange={(e) => handleChange("user_flow", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Contraintes ou limites connues</Label>
          <Textarea
            placeholder="Ce que vous ne ferez pas dans le MVP, limitations techniques ou temporelles"
            className="min-h-[100px]"
            value={formData.constraints}
            onChange={(e) => handleChange("constraints", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Technos et outils envisagés</Label>
          <Textarea
            placeholder="Outils no-code, tech stack, APIs, plateformes..."
            className="min-h-[100px]"
            value={formData.tools}
            onChange={(e) => handleChange("tools", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
