
import { useState, useEffect } from "react";
import ResourceForm from "../ResourceForm";
import { PersonaSection } from "./empathy-map/PersonaSection";
import { PerceptionSection } from "./empathy-map/PerceptionSection";
import { MotivationsSection } from "./empathy-map/MotivationsSection";
import { EmpathyMapFormData } from "./empathy-map/types";

interface EmpathyMapProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

export default function EmpathyMap({ stepId, substepTitle, subsubstepTitle }: EmpathyMapProps) {
  const [formData, setFormData] = useState<EmpathyMapFormData>({
    persona_name: "",
    persona_role: "",
    persona_age: "",
    thinks_says: "",
    does: "",
    feels: "",
    hears: "",
    sees: "",
    pains: "",
    gains: "",
    goals: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleDataSaved = (data: any) => {
    // On met à jour les données locales si nécessaire
    if (JSON.stringify(data) !== JSON.stringify(formData)) {
      setFormData(data);
    }
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="empathy_map"
      title="Carte d'Empathie Utilisateur"
      description="Développez une compréhension profonde des utilisateurs de votre solution"
      formData={formData}
      onDataSaved={handleDataSaved}
    >
      <div className="space-y-8">
        <PersonaSection 
          personaName={formData.persona_name}
          personaRole={formData.persona_role}
          personaAge={formData.persona_age}
          onChange={handleChange}
        />

        <PerceptionSection 
          thinksSays={formData.thinks_says}
          does={formData.does}
          feels={formData.feels}
          hears={formData.hears}
          sees={formData.sees}
          onChange={handleChange}
        />

        <MotivationsSection 
          pains={formData.pains}
          goals={formData.goals}
          gains={formData.gains}
          onChange={handleChange}
        />
      </div>
    </ResourceForm>
  );
}
