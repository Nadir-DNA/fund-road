
import SimpleResourceForm from "../SimpleResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface BusinessModelCanvasProps {
  stepId: number;
  substepTitle: string;
}

interface FormData {
  key_partners: string;
  key_activities: string;
  key_resources: string;
  value_propositions: string;
  customer_relationships: string;
  channels: string;
  customer_segments: string;
  cost_structure: string;
  revenue_streams: string;
}

export default function BusinessModelCanvas({ stepId, substepTitle }: BusinessModelCanvasProps) {
  const defaultValues: FormData = {
    key_partners: "",
    key_activities: "",
    key_resources: "",
    value_propositions: "",
    customer_relationships: "",
    channels: "",
    customer_segments: "",
    cost_structure: "",
    revenue_streams: ""
  };

  return (
    <SimpleResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="business_model_canvas"
      title="Business Model Canvas"
      description="Créez votre Business Model Canvas pour visualiser et structurer votre modèle d'affaires"
      defaultValues={defaultValues}
    >
      {({ formData, handleFormChange }: { formData: FormData; handleFormChange: (field: string, value: any) => void }) => (
        <div className="space-y-6">
          {/* Proposition de valeur - highlighted as most important */}
          <Card className="p-5 bg-primary/10 border-primary/20">
            <Label className="font-medium text-base mb-3 block">Proposition de valeur</Label>
            <Textarea 
              placeholder="Quelle valeur apportez-vous à vos clients ? Quels problèmes résolvez-vous ?"
              className="min-h-[150px]"
              value={formData?.value_propositions || ""}
              onChange={(e) => handleFormChange('value_propositions', e.target.value)}
            />
          </Card>
          
          {/* Segments de clientèle */}
          <Card className="p-5 bg-blue-50/10 border-blue-200/20">
            <Label className="font-medium text-base mb-3 block">Segments de clientèle</Label>
            <Textarea 
              placeholder="Qui sont vos clients les plus importants ?"
              className="min-h-[120px]"
              value={formData?.customer_segments || ""}
              onChange={(e) => handleFormChange('customer_segments', e.target.value)}
            />
          </Card>
          
          {/* Relations clients */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Relations clients</Label>
            <Textarea 
              placeholder="Comment interagissez-vous avec vos clients ?"
              className="min-h-[120px]"
              value={formData?.customer_relationships || ""}
              onChange={(e) => handleFormChange('customer_relationships', e.target.value)}
            />
          </Card>
          
          {/* Canaux */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Canaux</Label>
            <Textarea 
              placeholder="Comment atteignez-vous vos clients ?"
              className="min-h-[120px]"
              value={formData?.channels || ""}
              onChange={(e) => handleFormChange('channels', e.target.value)}
            />
          </Card>
          
          {/* Activités clés */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Activités clés</Label>
            <Textarea 
              placeholder="Quelles activités sont essentielles pour votre proposition de valeur ?"
              className="min-h-[120px]"
              value={formData?.key_activities || ""}
              onChange={(e) => handleFormChange('key_activities', e.target.value)}
            />
          </Card>
          
          {/* Ressources clés */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Ressources clés</Label>
            <Textarea 
              placeholder="Quelles ressources sont indispensables pour créer votre proposition de valeur ?"
              className="min-h-[120px]"
              value={formData?.key_resources || ""}
              onChange={(e) => handleFormChange('key_resources', e.target.value)}
            />
          </Card>
          
          {/* Partenaires clés */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Partenaires clés</Label>
            <Textarea 
              placeholder="Qui sont vos partenaires et fournisseurs essentiels ?"
              className="min-h-[120px]"
              value={formData?.key_partners || ""}
              onChange={(e) => handleFormChange('key_partners', e.target.value)}
            />
          </Card>
          
          {/* Financial section */}
          <h3 className="font-medium text-lg mt-2">Modèle financier</h3>
          
          {/* Structure de coûts */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Structure de coûts</Label>
            <Textarea 
              placeholder="Quels sont vos principaux coûts ?"
              className="min-h-[120px]"
              value={formData?.cost_structure || ""}
              onChange={(e) => handleFormChange('cost_structure', e.target.value)}
            />
          </Card>
          
          {/* Flux de revenus */}
          <Card className="p-5 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium text-base mb-3 block">Flux de revenus</Label>
            <Textarea 
              placeholder="Comment généreriez-vous des revenus ?"
              className="min-h-[120px]"
              value={formData?.revenue_streams || ""}
              onChange={(e) => handleFormChange('revenue_streams', e.target.value)}
            />
          </Card>
        </div>
      )}
    </SimpleResourceForm>
  );
}
