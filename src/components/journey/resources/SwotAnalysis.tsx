
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface SwotAnalysisProps {
  stepId: number;
  substepTitle: string;
}

export default function SwotAnalysis({ stepId, substepTitle }: SwotAnalysisProps) {
  const [formData, setFormData] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: ""
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="swot_analysis"
      title="Analyse SWOT"
      description="Identifiez vos forces, faiblesses, opportunités et menaces."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
      exportPanel={
        <ExportPanel 
          formData={formData}
          resourceType="swot_analysis"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4"><Label>Forces</Label>
          <Textarea
            placeholder="Ex : équipe expérimentée, techno propriétaire, réseau fort..."
            value={formData.strengths}
            onChange={(e) => handleChange("strengths", e.target.value)}
          />
        </Card>
        <Card className="p-4"><Label>Faiblesses</Label>
          <Textarea
            placeholder="Ex : manque de visibilité, ressources limitées, modèle flou..."
            value={formData.weaknesses}
            onChange={(e) => handleChange("weaknesses", e.target.value)}
          />
        </Card>
        <Card className="p-4"><Label>Opportunités</Label>
          <Textarea
            placeholder="Ex : marché en croissance, nouvelle réglementation favorable..."
            value={formData.opportunities}
            onChange={(e) => handleChange("opportunities", e.target.value)}
          />
        </Card>
        <Card className="p-4"><Label>Menaces</Label>
          <Textarea
            placeholder="Ex : nouveaux entrants, dépendance plateforme, contexte incertain..."
            value={formData.threats}
            onChange={(e) => handleChange("threats", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
