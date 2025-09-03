
import SimpleResourceForm from "../SimpleResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactEntry {
  investor: string;
  date_contacted: string;
  status: string;
  next_action: string;
}

interface InvestorFollowUpPlanProps {
  stepId: number;
  substepTitle: string;
}

export default function InvestorFollowUpPlan({ stepId, substepTitle }: InvestorFollowUpPlanProps) {
  const defaultValues: ContactEntry[] = [
    { investor: "", date_contacted: "", status: "", next_action: "" }
  ];

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="investor_followup_plan"
      title="Suivi des contacts investisseurs"
      description="Suivez vos échanges et vos prochaines relances avec les investisseurs."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: ContactEntry[]; handleFormChange: (field: string, value: any) => void }) => {
        const handleFieldChange = (index: number, field: keyof ContactEntry, value: string) => {
          const updated = [...(formData || defaultValues)];
          updated[index] = { ...updated[index], [field]: value };
          handleFormChange("contacts", updated);
        };

        const addRow = () => {
          const updated = [...(formData || defaultValues), { investor: "", date_contacted: "", status: "", next_action: "" }];
          handleFormChange("contacts", updated);
        };

        const contacts = formData || defaultValues;

        return (
          <div className="space-y-4">
            {contacts.map((entry, index) => (
              <Card key={index} className="p-4 space-y-2">
                <div>
                  <Label>Nom de l'investisseur</Label>
                  <Input
                    placeholder="Nom ou fond"
                    value={entry.investor}
                    onChange={(e) => handleFieldChange(index, "investor", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date du premier contact</Label>
                  <Input
                    placeholder="JJ/MM/AAAA"
                    value={entry.date_contacted}
                    onChange={(e) => handleFieldChange(index, "date_contacted", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Input
                    placeholder="Ex : Contacté, En cours, Refusé, Call planifié"
                    value={entry.status}
                    onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Prochaine action</Label>
                  <Input
                    placeholder="Ex : Renvoyer BP, relancer semaine prochaine"
                    value={entry.next_action}
                    onChange={(e) => handleFieldChange(index, "next_action", e.target.value)}
                  />
                </div>
              </Card>
            ))}
            <Button onClick={addRow} className="mt-2">➕ Ajouter un contact</Button>
          </div>
        );
      }}
    </SimpleResourceForm>
  );
}
