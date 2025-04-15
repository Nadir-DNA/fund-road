
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SWOTAnalysisProps {
  stepId: number;
  substepTitle: string;
}

export default function SWOTAnalysis({ stepId, substepTitle }: SWOTAnalysisProps) {
  const [formData, setFormData] = useState({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    strategy_so: "",
    strategy_st: "",
    strategy_wo: "",
    strategy_wt: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="swot_analysis"
      title="Analyse SWOT"
      description="Analysez les forces, faiblesses, opportunités et menaces de votre projet"
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Analyse interne et externe</h3>
          
          {/* Forces */}
          <div className="p-5 border rounded-md border-green-500/30 bg-green-500/10">
            <Label className="text-base font-medium mb-3 block">Forces (Strengths)</Label>
            <Textarea 
              placeholder="Quelles sont les forces internes de votre projet ?"
              className="min-h-[150px]"
              value={formData.strengths}
              onChange={(e) => handleChange('strengths', e.target.value)}
            />
          </div>

          {/* Faiblesses */}
          <div className="p-5 border rounded-md border-red-500/30 bg-red-500/10">
            <Label className="text-base font-medium mb-3 block">Faiblesses (Weaknesses)</Label>
            <Textarea 
              placeholder="Quelles sont les faiblesses internes de votre projet ?"
              className="min-h-[150px]"
              value={formData.weaknesses}
              onChange={(e) => handleChange('weaknesses', e.target.value)}
            />
          </div>

          {/* Opportunités */}
          <div className="p-5 border rounded-md border-blue-500/30 bg-blue-500/10">
            <Label className="text-base font-medium mb-3 block">Opportunités (Opportunities)</Label>
            <Textarea 
              placeholder="Quelles sont les opportunités externes pour votre projet ?"
              className="min-h-[150px]"
              value={formData.opportunities}
              onChange={(e) => handleChange('opportunities', e.target.value)}
            />
          </div>

          {/* Menaces */}
          <div className="p-5 border rounded-md border-amber-500/30 bg-amber-500/10">
            <Label className="text-base font-medium mb-3 block">Menaces (Threats)</Label>
            <Textarea 
              placeholder="Quelles sont les menaces externes pour votre projet ?"
              className="min-h-[150px]"
              value={formData.threats}
              onChange={(e) => handleChange('threats', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-medium text-lg mt-4">Stratégies d'action</h3>
          
          {/* Stratégie SO */}
          <div className="p-5 border rounded-md">
            <Label className="text-base font-medium mb-3 block">Stratégie Forces-Opportunités (S-O)</Label>
            <Textarea 
              placeholder="Comment utiliser vos forces pour tirer parti des opportunités ?"
              className="min-h-[120px]"
              value={formData.strategy_so}
              onChange={(e) => handleChange('strategy_so', e.target.value)}
            />
          </div>

          {/* Stratégie ST */}
          <div className="p-5 border rounded-md">
            <Label className="text-base font-medium mb-3 block">Stratégie Forces-Menaces (S-T)</Label>
            <Textarea 
              placeholder="Comment utiliser vos forces pour minimiser les menaces ?"
              className="min-h-[120px]"
              value={formData.strategy_st}
              onChange={(e) => handleChange('strategy_st', e.target.value)}
            />
          </div>

          {/* Stratégie WO */}
          <div className="p-5 border rounded-md">
            <Label className="text-base font-medium mb-3 block">Stratégie Faiblesses-Opportunités (W-O)</Label>
            <Textarea 
              placeholder="Comment surmonter vos faiblesses en saisissant les opportunités ?"
              className="min-h-[120px]"
              value={formData.strategy_wo}
              onChange={(e) => handleChange('strategy_wo', e.target.value)}
            />
          </div>

          {/* Stratégie WT */}
          <div className="p-5 border rounded-md">
            <Label className="text-base font-medium mb-3 block">Stratégie Faiblesses-Menaces (W-T)</Label>
            <Textarea 
              placeholder="Comment minimiser vos faiblesses et éviter les menaces ?"
              className="min-h-[120px]"
              value={formData.strategy_wt}
              onChange={(e) => handleChange('strategy_wt', e.target.value)}
            />
          </div>
        </div>
      </div>
    </ResourceForm>
  );
}
