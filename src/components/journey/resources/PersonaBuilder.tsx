
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PersonaBuilderProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  name: string;
  demographics: string;
  goals: string;
  frustrations: string;
  typical_day: string;
  quote: string;
}

export default function PersonaBuilder({ stepId, substepTitle }: PersonaBuilderProps) {
  const defaultValues: FormData = {
    name: "",
    demographics: "",
    goals: "",
    frustrations: "",
    typical_day: "",
    quote: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="persona_builder"
      title="Fiche Persona Utilisateur"
      description="Décrivez un utilisateur type que vous ciblez : ses besoins, son profil, ses frustrations et son comportement."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Nom (fictif ou réel)</Label>
            <Input
              placeholder="Ex : Julie, responsable RH"
              value={formData?.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Données démographiques</Label>
            <Textarea
              placeholder="Âge, localisation, métier, situation..."
              className="min-h-[80px]"
              value={formData?.demographics || ""}
              onChange={(e) => handleFormChange("demographics", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Objectifs / motivations</Label>
            <Textarea
              placeholder="Qu'est-ce qu'il/elle cherche à accomplir ?"
              className="min-h-[100px]"
              value={formData?.goals || ""}
              onChange={(e) => handleFormChange("goals", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Frustrations ou blocages</Label>
            <Textarea
              placeholder="Qu'est-ce qui lui rend la tâche difficile ?"
              className="min-h-[100px]"
              value={formData?.frustrations || ""}
              onChange={(e) => handleFormChange("frustrations", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Une journée type</Label>
            <Textarea
              placeholder="Décrivez brièvement une journée dans sa peau"
              className="min-h-[100px]"
              value={formData?.typical_day || ""}
              onChange={(e) => handleFormChange("typical_day", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Une citation qui résume son état d'esprit</Label>
            <Input
              placeholder="Ex : 'J'ai l'impression de courir après le temps en permanence'"
              value={formData?.quote || ""}
              onChange={(e) => handleFormChange("quote", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
