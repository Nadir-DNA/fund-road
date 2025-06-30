
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface UserResearchNotebookProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  observations: string;
  frustrations: string;
  citations: string;
  insight_principal: string;
}

function UserResearchNotebook({ stepId, substepTitle }: UserResearchNotebookProps) {
  const defaultValues: FormData = {
    observations: "",
    frustrations: "",
    citations: "",
    insight_principal: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="user_research_notebook"
      title="Journal d'observation utilisateur"
      description="Notez ici vos observations terrain, frustrations repérées, verbatims, et votre premier insight sur le besoin utilisateur."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5 bg-yellow-50/10 border-yellow-200/20">
            <Label className="font-medium text-base mb-3 block">Observations terrain</Label>
            <Textarea
              placeholder="Qu'avez-vous remarqué sur le terrain ? (comportements, usages...)"
              className="min-h-[120px]"
              value={formData?.observations || ""}
              onChange={(e) => handleFormChange('observations', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-red-50/10 border-red-200/20">
            <Label className="font-medium text-base mb-3 block">Frustrations identifiées</Label>
            <Textarea
              placeholder="Quels problèmes ou irritants avez-vous repérés chez les utilisateurs ?"
              className="min-h-[120px]"
              value={formData?.frustrations || ""}
              onChange={(e) => handleFormChange('frustrations', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-blue-50/10 border-blue-200/20">
            <Label className="font-medium text-base mb-3 block">Citations utilisateurs</Label>
            <Textarea
              placeholder="Notez ici des verbatims, des phrases exactes ou frappantes entendues"
              className="min-h-[120px]"
              value={formData?.citations || ""}
              onChange={(e) => handleFormChange('citations', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-emerald-50/10 border-emerald-200/20">
            <Label className="font-medium text-base mb-3 block">Insight principal</Label>
            <Textarea
              placeholder="Quel besoin sous-jacent ou récurrent commencez-vous à percevoir ?"
              className="min-h-[120px]"
              value={formData?.insight_principal || ""}
              onChange={(e) => handleFormChange('insight_principal', e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}

// Export par défaut explicite
export default UserResearchNotebook;
