import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MentorTrackingSheetProps {
  stepId: number;
  substepTitle: string;
}

interface Session {
  mentor_name: string;
  role: string;
  session_date: string;
  feedback: string;
  next_action: string;
}

export default function MentorTrackingSheet({ stepId, substepTitle }: MentorTrackingSheetProps) {
  const [formData, setFormData] = useState<Session[]>([
    { mentor_name: "", role: "", session_date: "", feedback: "", next_action: "" }
  ]);

  const handleChange = (index: number, field: keyof Session, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addSession = () => {
    setFormData(prev => [...prev, { mentor_name: "", role: "", session_date: "", feedback: "", next_action: "" }]);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mentor_tracking_sheet"
      title="Suivi accompagnement & mentorat"
      description="Centralisez vos interactions avec coachs, mentors ou structures d’accompagnement."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((entry, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div>
              <Label>Nom du mentor ou coach</Label>
              <Input
                placeholder="Ex : Alice Dupont"
                value={entry.mentor_name}
                onChange={(e) => handleChange(index, "mentor_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Rôle / expertise</Label>
              <Input
                placeholder="Ex : Produit, levée de fonds, juridique..."
                value={entry.role}
                onChange={(e) => handleChange(index, "role", e.target.value)}
              />
            </div>
            <div>
              <Label>Date de la session</Label>
              <Input
                placeholder="JJ/MM/AAAA"
                value={entry.session_date}
                onChange={(e) => handleChange(index, "session_date", e.target.value)}
              />
            </div>
            <div>
              <Label>Feedback reçu</Label>
              <Textarea
                placeholder="Conseils, alertes, recommandations, next steps..."
                value={entry.feedback}
                onChange={(e) => handleChange(index, "feedback", e.target.value)}
              />
            </div>
            <div>
              <Label>Action à suivre</Label>
              <Input
                placeholder="Ex : envoyer le pitch, tester l’offre, creuser une hypothèse..."
                value={entry.next_action}
                onChange={(e) => handleChange(index, "next_action", e.target.value)}
              />
            </div>
          </Card>
        ))}
        <Button onClick={addSession} className="mt-2">➕ Ajouter une session</Button>
      </div>
    </ResourceForm>
  );
}
