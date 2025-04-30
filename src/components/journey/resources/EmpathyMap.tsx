
import { useState, useRef } from "react";
import ResourceForm from "../ResourceForm";
import { PersonaSection } from "./empathy-map/PersonaSection";
import { PerceptionSection } from "./empathy-map/PerceptionSection";
import { MotivationsSection } from "./empathy-map/MotivationsSection";
import { EmpathyMapProps, EmpathyMapFormData } from "./empathy-map/types";

export default function EmpathyMap({ stepId, substepTitle, onClose }: EmpathyMapProps) {
  // Track first render to avoid initial data save loops
  const isFirstRender = useRef(true);
  const hasManualSave = useRef(false);
  
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
    // Si c'est le premier rendu, on ne fait rien pour éviter les boucles d'initialisation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log("EmpathyMap - Premier rendu, on ignore la sauvegarde initiale");
      return;
    }
    
    // Si l'utilisateur a explicitement demandé une sauvegarde, on ferme le panneau
    if (hasManualSave.current && onClose) {
      console.log("EmpathyMap - Sauvegarde manuelle, on ferme le panneau");
      hasManualSave.current = false;
      onClose();
    }
    
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
