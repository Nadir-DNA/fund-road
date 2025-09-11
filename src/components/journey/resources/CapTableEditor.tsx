
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CapTableEditorProps {
  stepId: number;
  substepTitle: string;
}

interface Shareholder {
  name: string;
  percent: string;
  contribution: string;
  role: string;
}

export default function CapTableEditor({ stepId, substepTitle }: CapTableEditorProps) {
  const defaultValues: Shareholder[] = [
    { name: "", percent: "", contribution: "", role: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cap_table_editor"
      title="Table de capitalisation"
      description="Saisissez les actionnaires actuels, leur part au capital, leur rôle et leurs apports."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: Shareholder[]; handleFormChange: (field: string, value: any) => void }) => {
        const handleFieldChange = (index: number, field: keyof Shareholder, value: string) => {
          const updated = [...(formData || defaultValues)];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("shareholders", updated);
        };

        const addRow = () => {
          const updated = [...(formData || defaultValues), { name: "", percent: "", contribution: "", role: "" }];
          handleFormChange("shareholders", updated);
        };

        const shareholders = formData || defaultValues;

        return (
          <div className="space-y-4">
            {shareholders.map((shareholder, index) => (
              <Card key={index} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom / structure</Label>
                  <Input
                    placeholder="Nom du fondateur ou investisseur"
                    value={shareholder.name}
                    onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>% au capital</Label>
                  <Input
                    placeholder="Ex : 30%"
                    value={shareholder.percent}
                    onChange={(e) => handleFieldChange(index, "percent", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Apport / investissement</Label>
                  <Input
                    placeholder="Ex : 20 000€"
                    value={shareholder.contribution}
                    onChange={(e) => handleFieldChange(index, "contribution", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Rôle</Label>
                  <Input
                    placeholder="Ex : Fondateur, BA, employé..."
                    value={shareholder.role}
                    onChange={(e) => handleFieldChange(index, "role", e.target.value)}
                  />
                </div>
              </Card>
            ))}
            <Button onClick={addRow} className="mt-2">➕ Ajouter une ligne</Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
