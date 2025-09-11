
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface FinancialTablesProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  revenue_year1: string;
  revenue_year2: string;
  revenue_year3: string;
  cost_year1: string;
  cost_year2: string;
  cost_year3: string;
  funding_needs: string;
}

export default function FinancialTables({ stepId, substepTitle }: FinancialTablesProps) {
  const defaultValues: FormData = {
    revenue_year1: "",
    revenue_year2: "",
    revenue_year3: "",
    cost_year1: "",
    cost_year2: "",
    cost_year3: "",
    funding_needs: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="financial_tables"
      title="Prévisions financières"
      description="Entrez vos projections sur 3 ans : revenus, coûts, besoins de financement."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <Label>Revenus Y1</Label>
            <Input
              placeholder="Ex : 50 000 €"
              value={formData?.revenue_year1 || ""}
              onChange={(e) => handleFormChange("revenue_year1", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Revenus Y2</Label>
            <Input
              placeholder="Ex : 150 000 €"
              value={formData?.revenue_year2 || ""}
              onChange={(e) => handleFormChange("revenue_year2", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Revenus Y3</Label>
            <Input
              placeholder="Ex : 300 000 €"
              value={formData?.revenue_year3 || ""}
              onChange={(e) => handleFormChange("revenue_year3", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Coûts Y1</Label>
            <Input
              placeholder="Ex : 20 000 €"
              value={formData?.cost_year1 || ""}
              onChange={(e) => handleFormChange("cost_year1", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Coûts Y2</Label>
            <Input
              placeholder="Ex : 80 000 €"
              value={formData?.cost_year2 || ""}
              onChange={(e) => handleFormChange("cost_year2", e.target.value)}
            />
          </Card>
          <Card className="p-4">
            <Label>Coûts Y3</Label>
            <Input
              placeholder="Ex : 120 000 €"
              value={formData?.cost_year3 || ""}
              onChange={(e) => handleFormChange("cost_year3", e.target.value)}
            />
          </Card>
          <Card className="p-4 md:col-span-3">
            <Label>Besoins de financement</Label>
            <Input
              placeholder="Montant total recherché pour financer le plan"
              value={formData?.funding_needs || ""}
              onChange={(e) => handleFormChange("funding_needs", e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
