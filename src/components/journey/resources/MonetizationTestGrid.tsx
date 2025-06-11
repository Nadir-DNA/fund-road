
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TestEntry {
  price_point: string;
  model_tested: string;
  conversion_rate: string;
  customer_feedback: string;
  next_test: string;
}

interface MonetizationTestGridProps {
  stepId: number;
  substepTitle: string;
}

export default function MonetizationTestGrid({ stepId, substepTitle }: MonetizationTestGridProps) {
  const defaultValues: TestEntry[] = [
    { price_point: "", model_tested: "", conversion_rate: "", customer_feedback: "", next_test: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="monetization_test_grid"
      title="Grille de test de monétisation"
      description="Suivez les différents modèles et prix testés pour identifier la formule optimale."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: TestEntry[]; handleFormChange: (field: string, value: any) => void }) => {
        const tests = Array.isArray(formData) ? formData : defaultValues;

        const handleFieldChange = (index: number, field: keyof TestEntry, value: string) => {
          const updated = [...tests];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("tests", updated);
        };

        const addTest = () => {
          const updated = [...tests, { price_point: "", model_tested: "", conversion_rate: "", customer_feedback: "", next_test: "" }];
          handleFormChange("tests", updated);
        };

        const removeTest = (index: number) => {
          if (tests.length > 1) {
            const updated = [...tests];
            updated.splice(index, 1);
            handleFormChange("tests", updated);
          }
        };

        return (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={index} className="p-4 space-y-3 relative">
                <div>
                  <Label>Prix testé</Label>
                  <Input
                    placeholder="Ex : 9,99€ / mois"
                    value={test.price_point}
                    onChange={(e) => handleFieldChange(index, "price_point", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Modèle testé</Label>
                  <Textarea
                    placeholder="Ex : Abonnement, freemium, licence..."
                    value={test.model_tested}
                    onChange={(e) => handleFieldChange(index, "model_tested", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Taux de conversion</Label>
                  <Input
                    placeholder="Nombre d'achats / inscriptions"
                    value={test.conversion_rate}
                    onChange={(e) => handleFieldChange(index, "conversion_rate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Feedback client</Label>
                  <Textarea
                    placeholder="Verbatims, avis, notes..."
                    value={test.customer_feedback}
                    onChange={(e) => handleFieldChange(index, "customer_feedback", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Prochain test</Label>
                  <Input
                    placeholder="Nouvelle hypothèse à tester"
                    value={test.next_test}
                    onChange={(e) => handleFieldChange(index, "next_test", e.target.value)}
                  />
                </div>
                {tests.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 text-red-500"
                    onClick={() => removeTest(index)}
                  >
                    <Trash2 size={18} />
                  </Button>
                )}
              </Card>
            ))}

            <Button onClick={addTest} className="mt-2">➕ Ajouter un test</Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
