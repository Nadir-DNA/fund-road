
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PitchStoryTellerProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  story_hook: string;
  emotional_angle: string;
  logical_sequence: string;
  wow_moment: string;
  call_to_action: string;
}

export default function PitchStoryTeller({ stepId, substepTitle }: PitchStoryTellerProps) {
  const defaultValues: FormData = {
    story_hook: "",
    emotional_angle: "",
    logical_sequence: "",
    wow_moment: "",
    call_to_action: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="pitch_storyteller"
      title="Narration & storytelling du pitch"
      description="Structurez un récit convaincant pour captiver vos interlocuteurs dès la première slide."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Accroche d'ouverture (hook)</Label>
            <Textarea
              placeholder="Stat, anecdote, punchline pour captiver dès la 1ère slide"
              value={formData?.story_hook || ""}
              onChange={(e) => handleFormChange("story_hook", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Angle émotionnel</Label>
            <Textarea
              placeholder="Quel sentiment ou frustration vous cherchez à activer chez votre audience ?"
              value={formData?.emotional_angle || ""}
              onChange={(e) => handleFormChange("emotional_angle", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Enchaînement logique</Label>
            <Textarea
              placeholder="Comment votre pitch avance logiquement de slide en slide ?"
              value={formData?.logical_sequence || ""}
              onChange={(e) => handleFormChange("logical_sequence", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Moment fort (wow factor)</Label>
            <Textarea
              placeholder="Ex : démo, traction inattendue, brevet, prix remporté..."
              value={formData?.wow_moment || ""}
              onChange={(e) => handleFormChange("wow_moment", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Conclusion et call-to-action</Label>
            <Textarea
              placeholder="Quel message fort ou appel à l'action à la fin ?"
              value={formData?.call_to_action || ""}
              onChange={(e) => handleFormChange("call_to_action", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
