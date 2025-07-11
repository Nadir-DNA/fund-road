
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface OpportunityDefinitionProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  trends: string;
  market_validation: string;
  early_signals: string;
  positioning: string;
  opportunity_statement: string;
}

export default function OpportunityDefinition({ stepId, substepTitle }: OpportunityDefinitionProps) {
  const defaultValues: FormData = {
    trends: "",
    market_validation: "",
    early_signals: "",
    positioning: "",
    opportunity_statement: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="opportunity_definition"
      title="Définition de l'opportunité"
      description="Formalisez les tendances, signaux faibles et analyses préliminaires qui montrent qu'il y a une vraie opportunité à explorer."
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          <Card className="p-5 bg-indigo-50/10 border-indigo-200/20">
            <Label className="font-medium text-base mb-3 block">Tendances observées</Label>
            <Textarea
              placeholder="Quelles tendances de fond ou signaux faibles observez-vous sur ce marché ?"
              className="min-h-[120px]"
              value={formData?.trends || ""}
              onChange={(e) => handleFormChange('trends', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-blue-50/10 border-blue-200/20">
            <Label className="font-medium text-base mb-3 block">Validation marché</Label>
            <Textarea
              placeholder="Qu'est-ce qui vous fait penser qu'il y a un marché réel derrière cette idée ?"
              className="min-h-[120px]"
              value={formData?.market_validation || ""}
              onChange={(e) => handleFormChange('market_validation', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-green-50/10 border-green-200/20">
            <Label className="font-medium text-base mb-3 block">Signaux d'intérêt préliminaires</Label>
            <Textarea
              placeholder="Avez-vous eu des retours spontanés, des pré-demandes, ou un intérêt exprimé ?"
              className="min-h-[120px]"
              value={formData?.early_signals || ""}
              onChange={(e) => handleFormChange('early_signals', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-yellow-50/10 border-yellow-200/20">
            <Label className="font-medium text-base mb-3 block">Positionnement pressenti</Label>
            <Textarea
              placeholder="Comment pensez-vous positionner votre offre par rapport à ce qui existe ?"
              className="min-h-[120px]"
              value={formData?.positioning || ""}
              onChange={(e) => handleFormChange('positioning', e.target.value)}
            />
          </Card>

          <Card className="p-5 bg-orange-50/10 border-orange-200/20">
            <Label className="font-medium text-base mb-3 block">Formulation de l'opportunité</Label>
            <Textarea
              placeholder="Formulez en une phrase l'opportunité que vous pensez avoir identifiée"
              className="min-h-[100px]"
              value={formData?.opportunity_statement || ""}
              onChange={(e) => handleFormChange('opportunity_statement', e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
