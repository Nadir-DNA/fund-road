import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Session {
  date: string;
  mentor_name: string;
  focus: string;
  key_advice: string;
  action_items: string;
}

interface MentorTrackingSheetProps {
  stepId: number;
  substepTitle: string;
}

export default function MentorTrackingSheet({ stepId, substepTitle }: MentorTrackingSheetProps) {
  const [formData, setFormData] = useState<Session[]>([
    { date: "", mentor_name: "", focus: "", key_advice: "", action_items: "" }
  ]);

  const handleChange = (index: number, field: keyof Session, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addSession = () => {
    setFormData(prev => [...prev, { date: "", mentor_name: "", focus: "", key_advice: "", action_items: "" }]);
  };

  const removeSession = (index: number) => {
    if (formData.length > 1) {
      const updated = [...formData];
      updated.splice(index, 1);
      setFormData(updated);
    }
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mentor_tracking_sheet"
      title="Suivi des sessions mentor"
      description="Gardez trace des conseils clés et actions à mettre en œuvre suite aux échanges avec vos mentors."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((entry, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div>
              <Label>Date de la session</Label>
              <Input
                placeholder="JJ/MM/AAAA"
                value={entry.date}
                onChange={(e) => handleChange(index, "date", e.target.value)}
              />
            </div>
            <div>
              <Label>Nom du mentor ou coach</Label>
              <Input
                placeholder="Ex : Alice Dupont"
                value={entry.mentor_name}
                onChange={(e) => handleChange(index, "mentor_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Focus de la session</Label>
              <Input
                placeholder="Ex : Projet, levée de fonds, juridique..."
                value={entry.focus}
                onChange={(e) => handleChange(index, "focus", e.target.value)}
              />
            </div>
            <div>
              <Label>Conseils clés</Label>
              <Textarea
                placeholder="Conseils, alertes, recommandations, next steps..."
                value={entry.key_advice}
                onChange={(e) => handleChange(index, "key_advice", e.target.value)}
              />
            </div>
            <div>
              <Label>Actions à suivre</Label>
              <Input
                placeholder="Ex : envoyer le pitch, tester l’offre, creuser une hypothèse..."
                value={entry.action_items}
                onChange={(e) => handleChange(index, "action_items", e.target.value)}
              />
            </div>
            <Button onClick={() => removeSession(index)} className="mt-2">
              <Trash2 />
            </Button>
          </Card>
        ))}
        <Button onClick={addSession} className="mt-2">➕ Ajouter une session</Button>
      </div>
    </ResourceForm>
  );
}
