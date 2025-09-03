
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CofounderProfileProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  name: string;
  role: string;
  experience: string;
  skills: string;
  contribution: string;
  motivation: string;
}

export default function CofounderProfile({ stepId, substepTitle }: CofounderProfileProps) {
  const defaultValues: FormData = {
    name: "",
    role: "",
    experience: "",
    skills: "",
    contribution: "",
    motivation: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cofounder_profile"
      title="Profil de cofondateur"
      description="Décrivez le profil d'un cofondateur recherché ou existant pour votre projet."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Nom / Prénom</Label>
            <Input
              placeholder="Nom du cofondateur ou recherché"
              value={formData?.name || ""}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Rôle envisagé</Label>
            <Input
              placeholder="Ex : CTO, CMO, Co-CEO..."
              value={formData?.role || ""}
              onChange={(e) => handleFormChange("role", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Expérience professionnelle</Label>
            <Textarea
              placeholder="Parcours, secteurs, entreprises précédentes..."
              className="min-h-[100px]"
              value={formData?.experience || ""}
              onChange={(e) => handleFormChange("experience", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Compétences clés</Label>
            <Textarea
              placeholder="Technologies, méthodologies, domaines d'expertise..."
              className="min-h-[100px]"
              value={formData?.skills || ""}
              onChange={(e) => handleFormChange("skills", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Contribution attendue</Label>
            <Textarea
              placeholder="Qu'apporte-t-il/elle concrètement au projet ?"
              className="min-h-[100px]"
              value={formData?.contribution || ""}
              onChange={(e) => handleFormChange("contribution", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Motivation / alignement</Label>
            <Textarea
              placeholder="Pourquoi s'investir dans ce projet ? Vision partagée ?"
              className="min-h-[100px]"
              value={formData?.motivation || ""}
              onChange={(e) => handleFormChange("motivation", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
