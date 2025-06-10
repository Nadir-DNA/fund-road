
import { useState } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface SwotAnalysisProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export default function SwotAnalysis({ stepId, substepTitle }: SwotAnalysisProps) {
  const [isExporting, setIsExporting] = useState(false);

  const defaultValues: FormData = {
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="swot_analysis"
      title="Analyse SWOT"
      description="Identifiez vos forces, faiblesses, opportunités et menaces."
      defaultValues={defaultValues}
      exportPanel={
        <ExportPanel 
          formData={defaultValues}
          resourceType="swot_analysis"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <Label>Forces</Label>
            <Textarea
              placeholder="Ex : équipe expérimentée, techno propriétaire, réseau fort..."
              value={formData?.strengths || ""}
              onChange={(e) => handleFormChange("strengths", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Faiblesses</Label>
            <Textarea
              placeholder="Ex : manque de visibilité, ressources limitées, modèle flou..."
              value={formData?.weaknesses || ""}
              onChange={(e) => handleFormChange("weaknesses", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Opportunités</Label>
            <Textarea
              placeholder="Ex : marché en croissance, nouvelle réglementation favorable..."
              value={formData?.opportunities || ""}
              onChange={(e) => handleFormChange("opportunities", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Menaces</Label>
            <Textarea
              placeholder="Ex : nouveaux entrants, dépendance plateforme, contexte incertain..."
              value={formData?.threats || ""}
              onChange={(e) => handleFormChange("threats", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
