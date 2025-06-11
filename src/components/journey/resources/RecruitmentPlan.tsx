
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface RecruitmentEntry {
  role: string;
  mission: string;
  profile: string;
  priority: string;
  timeline: string;
}

interface RecruitmentPlanProps {
  stepId: number;
  substepTitle: string;
}

export default function RecruitmentPlan({ stepId, substepTitle }: RecruitmentPlanProps) {
  const defaultValues: RecruitmentEntry[] = [
    { role: "", mission: "", profile: "", priority: "", timeline: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="recruitment_plan"
      title="Plan de recrutement"
      description="Anticipez vos besoins humains en définissant les futurs recrutements clés, leurs missions et leur priorité."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: RecruitmentEntry[]; handleFormChange: (field: string, value: any) => void }) => {
        const entries = Array.isArray(formData) ? formData : defaultValues;

        const handleChange = (index: number, field: keyof RecruitmentEntry, value: string) => {
          const updated = [...entries];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("entries", updated);
        };

        const addRecruitment = () => {
          const updated = [...entries, { role: "", mission: "", profile: "", priority: "", timeline: "" }];
          handleFormChange("entries", updated);
        };

        const removeRecruitment = (index: number) => {
          if (entries.length > 1) {
            const updated = [...entries];
            updated.splice(index, 1);
            handleFormChange("entries", updated);
          }
        };

        return (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={index} className="p-4 space-y-3 relative">
                <div>
                  <Label>Poste / Rôle</Label>
                  <Input
                    placeholder="Ex : Développeur full-stack, Sales B2B junior"
                    value={entry.role}
                    onChange={(e) => handleChange(index, "role", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mission principale</Label>
                  <Textarea
                    placeholder="Quel sera son rôle dans la croissance du projet ?"
                    value={entry.mission}
                    onChange={(e) => handleChange(index, "mission", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Profil recherché</Label>
                  <Textarea
                    placeholder="Expériences, compétences, mindset..."
                    value={entry.profile}
                    onChange={(e) => handleChange(index, "profile", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Priorité</Label>
                  <Input
                    placeholder="Haute / Moyenne / Faible"
                    value={entry.priority}
                    onChange={(e) => handleChange(index, "priority", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Calendrier prévu</Label>
                  <Input
                    placeholder="Ex : Q3 2025"
                    value={entry.timeline}
                    onChange={(e) => handleChange(index, "timeline", e.target.value)}
                  />
                </div>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 text-red-500"
                    onClick={() => removeRecruitment(index)}
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </Card>
            ))}
            <Button onClick={addRecruitment} className="mt-4">
              ➕ Ajouter un recrutement
            </Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
