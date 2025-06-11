
import SimpleResourceForm from "../SimpleResourceForm";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MarketSizeEstimatorProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

interface FormData {
  tam: number;
  sam: number;
  som: number;
  currency: string;
  tamName: string;
  samName: string;
  somName: string;
}

export default function MarketSizeEstimator({
  stepId,
  substepTitle,
  subsubstepTitle
}: MarketSizeEstimatorProps) {
  const defaultValues: FormData = {
    tam: 1000000,
    sam: 200000,
    som: 40000,
    currency: "€",
    tamName: "Total Available Market",
    samName: "Serviceable Available Market",
    somName: "Serviceable Obtainable Market"
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="market_size_estimator"
      title="Estimation du marché TAM/SAM/SOM"
      description="Estimez la taille de votre marché total, adressable et atteignable"
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => {
        const data = [
          { name: "TAM", value: formData?.tam || 0, color: "#3b82f6" },
          { name: "SAM", value: formData?.sam || 0, color: "#10b981" },
          { name: "SOM", value: formData?.som || 0, color: "#6366f1" }
        ];

        const formatter = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0
        });

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                <Label className="text-blue-400">TAM (Total Available Market)</Label>
                <div className="flex items-center mt-2">
                  <Input
                    type="number"
                    min="0"
                    value={formData?.tam || 0}
                    onChange={(e) => handleFormChange("tam", parseInt(e.target.value) || 0)}
                    className="border-blue-500/30 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Taille totale du marché pour votre produit/service.
                </p>
              </Card>

              <Card className="p-4 bg-green-500/10 border-green-500/30">
                <Label className="text-green-400">SAM (Serviceable Available Market)</Label>
                <div className="flex items-center mt-2">
                  <Input
                    type="number"
                    min="0"
                    max={formData?.tam || 0}
                    value={formData?.sam || 0}
                    onChange={(e) => handleFormChange("sam", parseInt(e.target.value) || 0)}
                    className="border-green-500/30 focus:ring-green-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Segment du marché que vous pouvez réellement servir.
                </p>
              </Card>

              <Card className="p-4 bg-indigo-500/10 border-indigo-500/30">
                <Label className="text-indigo-400">SOM (Serviceable Obtainable Market)</Label>
                <div className="flex items-center mt-2">
                  <Input
                    type="number"
                    min="0"
                    max={formData?.sam || 0}
                    value={formData?.som || 0}
                    onChange={(e) => handleFormChange("som", parseInt(e.target.value) || 0)}
                    className="border-indigo-500/30 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Part que vous pouvez réalistement obtenir.
                </p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Visualisation</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${formatter.format(value)}`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatter.format(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Résumé</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="font-medium">TAM:</span>
                  <span>{formatter.format(formData?.tam || 0)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">SAM:</span>
                  <span>{formatter.format(formData?.sam || 0)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">SOM:</span>
                  <span>{formatter.format(formData?.som || 0)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Ratio SAM/TAM:</span>
                  <span>{(((formData?.sam || 0) / (formData?.tam || 1)) * 100).toFixed(1)}%</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Ratio SOM/SAM:</span>
                  <span>{(((formData?.som || 0) / (formData?.sam || 1)) * 100).toFixed(1)}%</span>
                </li>
              </ul>
            </div>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
