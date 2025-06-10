
import { useState, useEffect } from "react";
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import ExportPanel from "../resource-form/ExportPanel";

interface DilutionSimulatorProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  current_valuation: string;
  funding_asked: string;
  post_money_valuation: string;
  investor_equity: string;
}

export default function DilutionSimulator({ stepId, substepTitle }: DilutionSimulatorProps) {
  const [isExporting, setIsExporting] = useState(false);

  const defaultValues: FormData = {
    current_valuation: "",
    funding_asked: "",
    post_money_valuation: "",
    investor_equity: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="dilution_simulator"
      title="Simulateur de dilution"
      description="Estimez la part du capital que prendrait un investisseur après votre levée."
      defaultValues={defaultValues}
      exportPanel={
        <ExportPanel 
          formData={defaultValues}
          resourceType="dilution_simulator"
          isExporting={isExporting}
          setIsExporting={setIsExporting}
        />
      }
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => {
        const calculateEquity = (postMoney: string, funding: string) => {
          const valuation = parseFloat(postMoney || "0");
          const asked = parseFloat(funding || "0");
          return valuation && asked ? ((asked / valuation) * 100).toFixed(2) + " %" : "";
        };

        // Auto-calculate equity when values change
        useEffect(() => {
          const equity = calculateEquity(formData?.post_money_valuation || "", formData?.funding_asked || "");
          if (equity && equity !== formData?.investor_equity) {
            handleFormChange("investor_equity", equity);
          }
        }, [formData?.post_money_valuation, formData?.funding_asked]);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <Label>Valorisation post-money</Label>
              <Input
                placeholder="Ex : 1 000 000 €"
                value={formData?.post_money_valuation || ""}
                onChange={(e) => handleFormChange("post_money_valuation", e.target.value)}
              />
            </Card>

            <Card className="p-5">
              <Label>Montant levé</Label>
              <Input
                placeholder="Ex : 200 000 €"
                value={formData?.funding_asked || ""}
                onChange={(e) => handleFormChange("funding_asked", e.target.value)}
              />
            </Card>

            <Card className="p-5 md:col-span-2">
              <Label>Part de l'investisseur estimée</Label>
              <Input
                readOnly
                value={formData?.investor_equity || ""}
                placeholder="% automatiquement calculé"
              />
            </Card>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
