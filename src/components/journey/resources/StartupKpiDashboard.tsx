import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface StartupKpiDashboardProps {
  stepId: number;
  substepTitle: string;
}

export default function StartupKpiDashboard({ stepId, substepTitle }: StartupKpiDashboardProps) {
  const [formData, setFormData] = useState({
    current_stage: "",
    north_star_metric: "",
    user_engagement: "",
    revenue: "",
    churn: "",
    acquisition_cost: "",
    lifetime_value: "",
    other_kpis: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="startup_kpi_dashboard"
      title="Dashboard KPI startup"
      description="Sélectionnez et suivez vos indicateurs clés de performance selon votre phase de développement."
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">

        <Card className="p-5">
          <Label>Stade actuel du projet</Label>
          <Input
            placeholder="Idéation / MVP / Pré-revenus / Traction / Scale"
            value={formData.current_stage}
            onChange={(e) => handleChange("current_stage", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>North Star Metric</Label>
          <Input
            placeholder="Ex : utilisateurs actifs hebdo, leads qualifiés, commandes livrées..."
            value={formData.north_star_metric}
            onChange={(e) => handleChange("north_star_metric", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Taux d'engagement / usage</Label>
          <Input
            placeholder="Ex : taux de rétention, DAU/MAU, sessions / utilisateur..."
            value={formData.user_engagement}
            onChange={(e) => handleChange("user_engagement", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Revenus actuels (mensuels ou annuels)</Label>
          <Input
            placeholder="Ex : 5 000 € MRR"
            value={formData.revenue}
            onChange={(e) => handleChange("revenue", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Churn ou taux d'attrition</Label>
          <Input
            placeholder="Ex : 4 % des clients mensuels"
            value={formData.churn}
            onChange={(e) => handleChange("churn", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Coût d’acquisition client (CAC)</Label>
          <Input
            placeholder="Ex : 12 € par client"
            value={formData.acquisition_cost}
            onChange={(e) => handleChange("acquisition_cost", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Valeur vie client (LTV)</Label>
          <Input
            placeholder="Ex : 180 €"
            value={formData.lifetime_value}
            onChange={(e) => handleChange("lifetime_value", e.target.value)}
          />
        </Card>

        <Card className="p-5">
          <Label>Autres KPIs spécifiques</Label>
          <Textarea
            placeholder="Ex : NPS, net revenue retention, nombre d'avis clients, temps moyen de réponse support..."
            value={formData.other_kpis}
            onChange={(e) => handleChange("other_kpis", e.target.value)}
          />
        </Card>

      </div>
    </ResourceForm>
  );
}
