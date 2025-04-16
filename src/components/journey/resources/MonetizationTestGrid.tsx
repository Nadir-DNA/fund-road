import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MonetizationTestGridProps {
  stepId: number;
  substepTitle: string;
}

interface TestEntry {
  hypothesis: string;
  method: string;
  result: string;
}

export default function MonetizationTestGrid({ stepId, substepTitle }: MonetizationTestGridProps) {
  const [formData, setFormData] = useState<TestEntry[]>([
    { hypothesis: "", method: "", result: "" }
  ]);

  const handleChange = (index: number, field: keyof TestEntry, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addTest = () => {
    setFormData(prev => [...prev, { hypothesis: "", method: "", result: "" }]);
  };

  const removeTest = (index: number) => {
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="monetization_test_grid"
      title="Grille de tests de monétisation"
      description="Notez vos hypothèses de monétisation testées (ex : landing page payante, email de précommande, offre test...)"
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((test, index) => (
          <Card key={index} className="p-4 space-y-3">
            <div>
              <Label>Hypothèse testée</Label>
              <Input
                placeholder="Ex : Les gens sont prêts à payer 15€/mois"
                value={test.hypothesis}
                onChange={(e) => handleChange(index, "hypothesis", e.target.value)}
              />
            </div>
            <div>
              <Label>Méthode utilisée</Label>
              <Textarea
                placeholder="Landing page, email, appel, Stripe test, etc."
                value={test.method}
                onChange={(e) => handleChange(index, "method", e.target.value)}
              />
            </div>
            <div>
              <Label>Résultat / retour</Label>
              <Textarea
                placeholder="Nombre de clics, réponses, achats, etc."
                value={test.result}
                onChange={(e) => handleChange(index, "result", e.target.value)}
              />
            </div>
          </Card>
        ))}

        <button onClick={addTest} className="text-sm mt-4 text-blue-600 hover:underline">
          ➕ Ajouter un test
        </button>
      </div>
    </ResourceForm>
  );
}
