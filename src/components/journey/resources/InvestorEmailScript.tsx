
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface InvestorEmailScriptProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  subject: string;
  intro: string;
  traction: string;
  ask_summary: string;
  closing: string;
}

export default function InvestorEmailScript({ stepId, substepTitle }: InvestorEmailScriptProps) {
  const defaultValues: FormData = {
    subject: "",
    intro: "",
    traction: "",
    ask_summary: "",
    closing: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="investor_email_script"
      title="Script d'email investisseurs"
      description="Préparez votre message d'accroche pour contacter un investisseur de manière claire et efficace."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Objet de l'email</Label>
            <Textarea
              placeholder="Ex : [Nom startup] – Levée en cours, traction forte"
              value={formData?.subject || ""}
              onChange={(e) => handleFormChange("subject", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Introduction personnalisée</Label>
            <Textarea
              placeholder="Lien avec l'investisseur ou contexte de contact"
              value={formData?.intro || ""}
              onChange={(e) => handleFormChange("intro", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>TractioN & projet en une phrase</Label>
            <Textarea
              placeholder="Ex : Nous avons généré 10k€ MRR en 3 mois avec une solution IA B2B"
              value={formData?.traction || ""}
              onChange={(e) => handleFormChange("traction", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Résumé de la demande</Label>
            <Textarea
              placeholder="Ex : Nous levons 500k€ pour accélérer la commercialisation"
              value={formData?.ask_summary || ""}
              onChange={(e) => handleFormChange("ask_summary", e.target.value)}
            />
          </Card>
          <Card className="p-5">
            <Label>Call-to-action</Label>
            <Textarea
              placeholder="Ex : Seriez-vous ouvert à un rapide échange ?"
              value={formData?.closing || ""}
              onChange={(e) => handleFormChange("closing", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
