
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
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Row 1 */}
        <Card className="p-4 lg:col-span-1 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium mb-2 block">Partenaires clés</Label>
          <Textarea 
            placeholder="Qui sont vos partenaires et fournisseurs essentiels ?"
            className="min-h-[160px] lg:min-h-[220px]"
            value={formData.key_partners}
            onChange={(e) => handleChange('key_partners', e.target.value)}
          />
        </Card>
        
        <div className="lg:col-span-2">
          <Card className="p-4 mb-4 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium mb-2 block">Activités clés</Label>
            <Textarea 
              placeholder="Quelles activités sont essentielles pour votre proposition de valeur ?"
              value={formData.key_activities}
              onChange={(e) => handleChange('key_activities', e.target.value)}
            />
          </Card>
          
          <Card className="p-4 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium mb-2 block">Ressources clés</Label>
            <Textarea 
              placeholder="Quelles ressources sont indispensables pour créer votre proposition de valeur ?"
              value={formData.key_resources}
              onChange={(e) => handleChange('key_resources', e.target.value)}
            />
          </Card>
        </div>
        
        <Card className="p-4 lg:col-span-1 bg-primary/10 border-primary/20">
          <Label className="font-medium mb-2 block">Proposition de valeur</Label>
          <Textarea 
            placeholder="Quelle valeur apportez-vous à vos clients ? Quels problèmes résolvez-vous ?"
            className="min-h-[160px] lg:min-h-[220px]"
            value={formData.value_propositions}
            onChange={(e) => handleChange('value_propositions', e.target.value)}
          />
        </Card>
        
        <div className="lg:col-span-1">
          <Card className="p-4 mb-4 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium mb-2 block">Relations clients</Label>
            <Textarea 
              placeholder="Comment interagissez-vous avec vos clients ?"
              value={formData.customer_relationships}
              onChange={(e) => handleChange('customer_relationships', e.target.value)}
            />
          </Card>
          
          <Card className="p-4 bg-gray-50/10 border-gray-200/20">
            <Label className="font-medium mb-2 block">Canaux</Label>
            <Textarea 
              placeholder="Comment atteignez-vous vos clients ?"
              value={formData.channels}
              onChange={(e) => handleChange('channels', e.target.value)}
            />
          </Card>
        </div>
        
        {/* Row 2 */}
        <div className="lg:col-span-5 h-4"></div>
        
        {/* Row 3 */}
        <Card className="p-4 lg:col-span-3 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium mb-2 block">Structure de coûts</Label>
          <Textarea 
            placeholder="Quels sont vos principaux coûts ?"
            value={formData.cost_structure}
            onChange={(e) => handleChange('cost_structure', e.target.value)}
          />
        </Card>
        
        <Card className="p-4 lg:col-span-2 bg-gray-50/10 border-gray-200/20">
          <Label className="font-medium mb-2 block">Flux de revenus</Label>
          <Textarea 
            placeholder="Comment généreriez-vous des revenus ?"
            value={formData.revenue_streams}
            onChange={(e) => handleChange('revenue_streams', e.target.value)}
          />
        </Card>
        
        <Card className="p-4 lg:col-span-5 bg-blue-50/10 border-blue-200/20">
          <Label className="font-medium mb-2 block">Segments de clientèle</Label>
          <Textarea 
            placeholder="Qui sont vos clients les plus importants ?"
            value={formData.customer_segments}
            onChange={(e) => handleChange('customer_segments', e.target.value)}
          />
        </Card>
      </div>
    </ResourceForm>
  );
}
