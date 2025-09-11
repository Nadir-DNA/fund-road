
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface IPStrategyCanvasProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  innovation_type: string;
  need_for_exclusivity: string;
  time_to_market: string;
  team_ip_skills: string;
  protection_path_selected: string;
  risks_if_unprotected: string;
}

export default function IPStrategyCanvas({ stepId, substepTitle }: IPStrategyCanvasProps) {
  const defaultValues: FormData = {
    innovation_type: "",
    need_for_exclusivity: "",
    time_to_market: "",
    team_ip_skills: "",
    protection_path_selected: "",
    risks_if_unprotected: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="ip_strategy_canvas"
      title="Canvas de stratégie PI"
      description="Identifiez la meilleure approche de protection intellectuelle pour votre innovation en phase startup."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5">
            <Label>Quel est le cœur de votre innovation ?</Label>
            <Textarea
              placeholder="Algo, interface, méthode, marque, base de données..."
              value={formData?.innovation_type || ""}
              onChange={(e) => handleFormChange("innovation_type", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Avez-vous besoin d'une exclusivité forte sur cette innovation ?</Label>
            <Textarea
              placeholder="Oui (barrière à l'entrée), non (accès libre, network effect...)"
              value={formData?.need_for_exclusivity || ""}
              onChange={(e) => handleFormChange("need_for_exclusivity", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Délai entre idée et mise sur le marché ?</Label>
            <Textarea
              placeholder="Court (<6 mois) / Moyen (6-18 mois) / Long (>18 mois)"
              value={formData?.time_to_market || ""}
              onChange={(e) => handleFormChange("time_to_market", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Compétences internes sur la PI ?</Label>
            <Textarea
              placeholder="Connaissance juridique, accompagnement externe, avocat PI..."
              value={formData?.team_ip_skills || ""}
              onChange={(e) => handleFormChange("team_ip_skills", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quelle stratégie de protection envisagez-vous ?</Label>
            <Textarea
              placeholder="Ex : dépôt de brevet, marque, code sous NDA, secret industriel, open source partiel..."
              value={formData?.protection_path_selected || ""}
              onChange={(e) => handleFormChange("protection_path_selected", e.target.value)}
            />
          </Card>

          <Card className="p-5">
            <Label>Quels sont les risques si vous ne protégez rien ?</Label>
            <Textarea
              placeholder="Copie, exploitation commerciale, perte d'exclusivité, image affaiblie..."
              value={formData?.risks_if_unprotected || ""}
              onChange={(e) => handleFormChange("risks_if_unprotected", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
