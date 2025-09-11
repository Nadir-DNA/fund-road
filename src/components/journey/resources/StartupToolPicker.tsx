
import SimpleResourceForm from "../SimpleResourceForm";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface StartupToolPickerProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  objective: string;
  tools_used: string;
  pain_points: string;
  tools_to_explore: string;
  integrations_needed: string;
}

export default function StartupToolPicker({ stepId, substepTitle }: StartupToolPickerProps) {
  const defaultValues: FormData = {
    objective: "",
    tools_used: "",
    pain_points: "",
    tools_to_explore: "",
    integrations_needed: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="startup_tool_picker"
      title="Sélecteur d'outils startup"
      description="Identifiez les outils les plus utiles pour votre projet à chaque étape : design, gestion, communication, IA, no-code…"
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Objectif principal à optimiser avec un outil</Label>
            <Textarea
              placeholder="Ex : organiser mon roadmap produit, faire des maquettes, automatiser mon CRM..."
              value={formData?.objective || ""}
              onChange={(e) => handleFormChange("objective", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Outils actuellement utilisés</Label>
            <Textarea
              placeholder="Ex : Notion, Trello, Figma, Airtable, Webflow..."
              value={formData?.tools_used || ""}
              onChange={(e) => handleFormChange("tools_used", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Points de friction ou manques</Label>
            <Textarea
              placeholder="Ce qui vous ralentit, ce qui vous manque dans vos outils actuels"
              value={formData?.pain_points || ""}
              onChange={(e) => handleFormChange("pain_points", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Outils ou catégories à explorer</Label>
            <Textarea
              placeholder="Ex : IA, gestion d'équipe, automatisation, analytics, SEO..."
              value={formData?.tools_to_explore || ""}
              onChange={(e) => handleFormChange("tools_to_explore", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Intégrations souhaitées</Label>
            <Textarea
              placeholder="Notion ↔ Slack, CRM ↔ WhatsApp, Airtable ↔ Zapier, etc."
              value={formData?.integrations_needed || ""}
              onChange={(e) => handleFormChange("integrations_needed", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
