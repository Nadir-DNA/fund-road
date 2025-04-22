
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface BusinessModelCanvasProps {
  stepId: number;
  substepTitle: string;
}

export default function BusinessModelCanvas({ stepId, substepTitle }: BusinessModelCanvasProps) {
  const [formData, setFormData] = useState({
    key_partners: "",
    key_activities: "",
    key_resources: "",
    value_propositions: "",
    customer_relationships: "",
    channels: "",
    customer_segments: "",
    cost_structure: "",
    revenue_streams: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="business_model_canvas"
      title="Business Model Canvas"
      description="Créez votre Business Model Canvas pour visualiser et structurer votre modèle d'affaires"
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        {/* Proposition de valeur - highlighted as most important */}
        <Card className="p-5 bg-primary/10 border-primary/20">
          <Label className="font-medium text-base mb-3 block">Proposition de valeur</Label>
          <Textarea 
            placeholder="Quelle valeur apportez-vous à vos clients ? Quels problèmes résolvez-vous ?"
            className="min-h-[150px]"
            value={formData.value_propositions}
            onChange={(e) => handleChange('value_propositions', e.target.value)}
          />
        </Card>
        
        {/* Segments de clientèle */}
        <Card className="p-5 bg-blue-50/10 border-blue-200/20">
          <Label className="font-medium text-base mb-3 block">Segments de clientèle</Label>
          <Textarea 
            placeholder="Qui sont vos clients les plus importants ?"
            className="min-h-[120px]"
            value={formData.customer_segments}
            onChange={(e) => handleChange('customer_segments', e.target.value)}
          />
        </Card>
        
        {/* Relations clients */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Relations clients</Label>
          <Textarea 
            placeholder="Comment interagissez-vous avec vos clients ?"
            className="min-h-[120px]"
            value={formData.customer_relationships}
            onChange={(e) => handleChange('customer_relationships', e.target.value)}
          />
        </Card>
        
        {/* Canaux */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Canaux</Label>
          <Textarea 
            placeholder="Comment atteignez-vous vos clients ?"
            className="min-h-[120px]"
            value={formData.channels}
            onChange={(e) => handleChange('channels', e.target.value)}
          />
        </Card>
        
        {/* Activités clés */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Activités clés</Label>
          <Textarea 
            placeholder="Quelles activités sont essentielles pour votre proposition de valeur ?"
            className="min-h-[120px]"
            value={formData.key_activities}
            onChange={(e) => handleChange('key_activities', e.target.value)}
          />
        </Card>
        
        {/* Ressources clés */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Ressources clés</Label>
          <Textarea 
            placeholder="Quelles ressources sont indispensables pour créer votre proposition de valeur ?"
            className="min-h-[120px]"
            value={formData.key_resources}
            onChange={(e) => handleChange('key_resources', e.target.value)}
          />
        </Card>
        
        {/* Partenaires clés */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Partenaires clés</Label>
          <Textarea 
            placeholder="Qui sont vos partenaires et fournisseurs essentiels ?"
            className="min-h-[120px]"
            value={formData.key_partners}
            onChange={(e) => handleChange('key_partners', e.target.value)}
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
            value={formData.cost_structure}
            onChange={(e) => handleChange('cost_structure', e.target.value)}
          />
        </Card>
        
        {/* Flux de revenus */}
        <Card className="p-5 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium text-base mb-3 block">Flux de revenus</Label>
          <Textarea 
            placeholder="Comment généreriez-vous des revenus ?"
            className="min-h-[120px]"
            value={formData.revenue_streams}
            onChange={(e) => handleChange('revenue_streams', e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
