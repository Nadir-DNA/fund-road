import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface InvestorEmailScriptProps {
  stepId: number;
  substepTitle: string;
}

export default function InvestorEmailScript({ stepId, substepTitle }: InvestorEmailScriptProps) {
  const [formData, setFormData] = useState({
    subject: "",
    intro: "",
    traction: "",
    ask_summary: "",
    closing: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="investor_email_script"
      title="Script d’email investisseurs"
      description="Préparez votre message d’accroche pour contacter un investisseur de manière claire et efficace."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <Card className="p-5"><Label>Objet de l’email</Label>
          <Textarea
            placeholder="Ex : [Nom startup] – Levée en cours, traction forte"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Introduction personnalisée</Label>
          <Textarea
            placeholder="Lien avec l’investisseur ou contexte de contact"
            value={formData.intro}
            onChange={(e) => handleChange("intro", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>TractioN & projet en une phrase</Label>
          <Textarea
            placeholder="Ex : Nous avons généré 10k€ MRR en 3 mois avec une solution IA B2B"
            value={formData.traction}
            onChange={(e) => handleChange("traction", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Résumé de la demande</Label>
          <Textarea
            placeholder="Ex : Nous levons 500k€ pour accélérer la commercialisation"
            value={formData.ask_summary}
            onChange={(e) => handleChange("ask_summary", e.target.value)}
          />
        </Card>
        <Card className="p-5"><Label>Call-to-action</Label>
          <Textarea
            placeholder="Ex : Seriez-vous ouvert à un rapide échange ?"
            value={formData.closing}
            onChange={(e) => handleChange("closing", e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
