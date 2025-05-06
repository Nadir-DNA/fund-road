
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MarketSizeEstimatorProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

export default function MarketSizeEstimator({
  stepId,
  substepTitle,
  subsubstepTitle
}: MarketSizeEstimatorProps) {
  const [market, setMarket] = useState({
    tam: 1000000,
    sam: 200000,
    som: 40000,
    currency: "€",
    tamName: "Total Available Market",
    samName: "Serviceable Available Market",
    somName: "Serviceable Obtainable Market"
  });
  
  console.log("MarketSizeEstimator rendered", { stepId, substepTitle });

  const handleChange = (field: keyof typeof market, value: any) => {
    setMarket(prev => ({
      ...prev,
      [field]: field === 'tam' || field === 'sam' || field === 'som' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const data = [
    { name: "TAM", value: market.tam, color: "#3b82f6" },
    { name: "SAM", value: market.sam, color: "#10b981" },
    { name: "SOM", value: market.som, color: "#6366f1" }
  ];

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Estimation du marché TAM/SAM/SOM</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <Label className="text-blue-400">TAM (Total Available Market)</Label>
          <div className="flex items-center mt-2">
            <Input
              type="number"
              min="0"
              value={market.tam}
              onChange={(e) => handleChange("tam", e.target.value)}
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
              max={market.tam}
              value={market.sam}
              onChange={(e) => handleChange("sam", e.target.value)}
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
              max={market.sam}
              value={market.som}
              onChange={(e) => handleChange("som", e.target.value)}
              className="border-indigo-500/30 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Part que vous pouvez réalistement obtenir.
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-slate-800">
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
            <span>{formatter.format(market.tam)}</span>
          </li>
          <li className="flex justify-between">
            <span className="font-medium">SAM:</span>
            <span>{formatter.format(market.sam)}</span>
          </li>
          <li className="flex justify-between">
            <span className="font-medium">SOM:</span>
            <span>{formatter.format(market.som)}</span>
          </li>
          <li className="flex justify-between">
            <span className="font-medium">Ratio SAM/TAM:</span>
            <span>{((market.sam / market.tam) * 100).toFixed(1)}%</span>
          </li>
          <li className="flex justify-between">
            <span className="font-medium">Ratio SOM/SAM:</span>
            <span>{((market.som / market.sam) * 100).toFixed(1)}%</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
