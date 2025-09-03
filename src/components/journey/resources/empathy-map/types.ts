
export interface EmpathyMapFormData {
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

export interface EmpathyMapProps {
  stepId: number;
  substepTitle: string;
  onClose?: () => void;
}
