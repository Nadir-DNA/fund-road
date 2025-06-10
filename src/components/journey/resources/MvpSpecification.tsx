
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MvpSpecificationProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  mvp_goal: string;
  mvp_scope: string;
  user_flow: string;
  constraints: string;
  tools: string;
}

export default function MvpSpecification({ stepId, substepTitle }: MvpSpecificationProps) {
  const defaultValues: FormData = {
    mvp_goal: "",
    mvp_scope: "",
    user_flow: "",
    constraints: "",
    tools: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mvp_specification"
      title="Cahier des charges MVP"
      description="Spécifiez précisément ce que contiendra votre produit minimum viable et comment il sera construit."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Objectif principal du MVP</Label>
            <Textarea
              placeholder="Ce que vous voulez démontrer ou valider avec cette première version"
              className="min-h-[100px]"
              value={formData?.mvp_goal || ""}
              onChange={(e) => handleFormChange("mvp_goal", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Périmètre fonctionnel</Label>
            <Textarea
              placeholder="Quelles sont les fonctionnalités couvertes dans ce MVP ?"
              className="min-h-[100px]"
              value={formData?.mvp_scope || ""}
              onChange={(e) => handleFormChange("mvp_scope", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Parcours utilisateur</Label>
            <Textarea
              placeholder="À quoi ressemble l'expérience utilisateur du MVP ?"
              className="min-h-[100px]"
              value={formData?.user_flow || ""}
              onChange={(e) => handleFormChange("user_flow", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Contraintes ou limites connues</Label>
            <Textarea
              placeholder="Ce que vous ne ferez pas dans le MVP, limitations techniques ou temporelles"
              className="min-h-[100px]"
              value={formData?.constraints || ""}
              onChange={(e) => handleFormChange("constraints", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Technos et outils envisagés</Label>
            <Textarea
              placeholder="Outils no-code, tech stack, APIs, plateformes..."
              className="min-h-[100px]"
              value={formData?.tools || ""}
              onChange={(e) => handleFormChange("tools", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
