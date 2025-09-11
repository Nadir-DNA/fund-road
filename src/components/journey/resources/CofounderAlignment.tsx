
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CofounderAlignmentProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  vision: string;
  values: string;
  ambition: string;
  scenario_exit: string;
  decision_rules: string;
}

export default function CofounderAlignment({ stepId, substepTitle }: CofounderAlignmentProps) {
  const defaultValues: FormData = {
    vision: "",
    values: "",
    ambition: "",
    scenario_exit: "",
    decision_rules: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cofounder_alignment"
      title="Matrice alignement cofondateurs"
      description="Cernez les points d'alignement ou de tension potentiels entre associés."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Vision long terme</Label>
            <Textarea
              placeholder="Ex : devenir leader en Europe, rester une entreprise indépendante, etc."
              value={formData?.vision || ""}
              onChange={(e) => handleFormChange("vision", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Valeurs fondamentales</Label>
            <Textarea
              placeholder="Ex : transparence, rigueur, ambition, entraide..."
              value={formData?.values || ""}
              onChange={(e) => handleFormChange("values", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Objectifs personnels</Label>
            <Textarea
              placeholder="Qu'attendez-vous personnellement du projet ?"
              value={formData?.ambition || ""}
              onChange={(e) => handleFormChange("ambition", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Scénario de sortie</Label>
            <Textarea
              placeholder="Que se passerait-il si quelqu'un voulait partir ?"
              value={formData?.scenario_exit || ""}
              onChange={(e) => handleFormChange("scenario_exit", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Règles de décision collective</Label>
            <Textarea
              placeholder="Comment gérez-vous les désaccords ?"
              value={formData?.decision_rules || ""}
              onChange={(e) => handleFormChange("decision_rules", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
