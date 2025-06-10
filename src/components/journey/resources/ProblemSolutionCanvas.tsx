
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ProblemSolutionCanvasProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  user_problem: string;
  root_cause: string;
  current_alternative: string;
  proposed_solution: string;
  key_differentiator: string;
}

export default function ProblemSolutionCanvas({ stepId, substepTitle }: ProblemSolutionCanvasProps) {
  const defaultValues: FormData = {
    user_problem: "",
    root_cause: "",
    current_alternative: "",
    proposed_solution: "",
    key_differentiator: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="problem_solution_canvas"
      title="Canvas Problème / Solution"
      description="Formulez clairement le problème principal rencontré par votre cible, et la solution que vous proposez."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5 bg-red-50/10 border-red-200/20">
            <Label>Problème utilisateur principal</Label>
            <Textarea
              placeholder="Quel est le principal irritant ou blocage vécu par vos utilisateurs ?"
              className="min-h-[120px]"
              value={formData?.user_problem || ""}
              onChange={(e) => handleFormChange("user_problem", e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-yellow-50/10 border-yellow-200/20">
            <Label>Cause racine identifiée</Label>
            <Textarea
              placeholder="Pourquoi ce problème existe-t-il ? (structurel, contextuel, etc.)"
              className="min-h-[100px]"
              value={formData?.root_cause || ""}
              onChange={(e) => handleFormChange("root_cause", e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-blue-50/10 border-blue-200/20">
            <Label>Solution actuelle (alternative)</Label>
            <Textarea
              placeholder="Comment les utilisateurs gèrent-ils ce problème aujourd'hui ?"
              className="min-h-[100px]"
              value={formData?.current_alternative || ""}
              onChange={(e) => handleFormChange("current_alternative", e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-green-50/10 border-green-200/20">
            <Label>Solution que vous proposez</Label>
            <Textarea
              placeholder="Quel est le cœur de votre proposition ?"
              className="min-h-[120px]"
              value={formData?.proposed_solution || ""}
              onChange={(e) => handleFormChange("proposed_solution", e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-emerald-50/10 border-emerald-200/20">
            <Label>Différenciateur clé</Label>
            <Textarea
              placeholder="Pourquoi votre solution est-elle meilleure ou différente ?"
              className="min-h-[100px]"
              value={formData?.key_differentiator || ""}
              onChange={(e) => handleFormChange("key_differentiator", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
