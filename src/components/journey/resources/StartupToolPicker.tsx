import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface StartupToolPickerProps {
  stepId: number;
  substepTitle: string;
}

export default function StartupToolPicker({ stepId, substepTitle }: StartupToolPickerProps) {
  const [formData, setFormData] = useState({
    objective: "",
    tools_used: "",
    pain_points: "",
    tools_to_explore: "",
    integrations_needed: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="startup_tool_picker"
      title="Sélecteur d'outils startup"
      description="Identifiez les outils les plus utiles pour votre projet à chaque étape : design, gestion, communication, IA, no-code…"
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">

        <Card className="p-5">
          <Label>Objectif principal à optimiser avec un outil</Label>
          <Textarea
            placeholder="Ex : organiser mon roadmap produit, faire des maquettes, automatiser mon CRM..."
            value={formData.objective}
            onChange={(e) => handleChange("objective", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Outils actuellement utilisés</Label>
          <Textarea
            placeholder="Ex : Notion, Trello, Figma, Airtable, Webflow..."
            value={formData.tools_used}
            onChange={(e) => handleChange("tools_used", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Points de friction ou manques</Label>
          <Textarea
            placeholder="Ce qui vous ralentit, ce qui vous manque dans vos outils actuels"
            value={formData.pain_points}
            onChange={(e) => handleChange("pain_points", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Outils ou catégories à explorer</Label>
          <Textarea
            placeholder="Ex : IA, gestion d’équipe, automatisation, analytics, SEO..."
            value={formData.tools_to_explore}
            onChange={(e) => handleChange("tools_to_explore", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Intégrations souhaitées</Label>
          <Textarea
            placeholder="Notion ↔ Slack, CRM ↔ WhatsApp, Airtable ↔ Zapier, etc."
            value={formData.integrations_needed}
            onChange={(e) => handleChange("integrations_needed", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
