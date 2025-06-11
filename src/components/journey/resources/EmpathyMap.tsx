
import SimpleResourceForm from "../SimpleResourceForm";
import { PersonaSection } from "./empathy-map/PersonaSection";
import { PerceptionSection } from "./empathy-map/PerceptionSection";
import { MotivationsSection } from "./empathy-map/MotivationsSection";

interface EmpathyMapProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

interface FormData {
  persona_name: string;
  persona_role: string;
  persona_age: string;
  thinks_says: string;
  does: string;
  feels: string;
  hears: string;
  sees: string;
  pains: string;
  gains: string;
  goals: string;
}

export default function EmpathyMap({ stepId, substepTitle, subsubstepTitle }: EmpathyMapProps) {
  const defaultValues: FormData = {
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
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="empathy_map"
      title="Carte d'Empathie Utilisateur"
      description="Développez une compréhension profonde des utilisateurs de votre solution"
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-8">
          <PersonaSection 
            personaName={formData?.persona_name || ""}
            personaRole={formData?.persona_role || ""}
            personaAge={formData?.persona_age || ""}
            onChange={handleFormChange}
          />

          <PerceptionSection 
            thinksSays={formData?.thinks_says || ""}
            does={formData?.does || ""}
            feels={formData?.feels || ""}
            hears={formData?.hears || ""}
            sees={formData?.sees || ""}
            onChange={handleFormChange}
          />

          <MotivationsSection 
            pains={formData?.pains || ""}
            goals={formData?.goals || ""}
            gains={formData?.gains || ""}
            onChange={handleFormChange}
          />
        </div>
      )}
    </SimpleResourceForm>
  );
}
