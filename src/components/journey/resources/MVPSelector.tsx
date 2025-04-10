
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MVPSelectorProps {
  stepId: number;
  substepTitle: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  complexity: number; // 1-5
  impact: number; // 1-5
  inMvp: boolean;
}

export default function MVPSelector({ stepId, substepTitle }: MVPSelectorProps) {
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "1",
      name: "Authentification utilisateur",
      description: "Système de login/signup avec email et mot de passe",
      priority: "must",
      complexity: 2,
      impact: 5,
      inMvp: true
    },
    {
      id: "2",
      name: "Dashboard principal",
      description: "Vue d'ensemble des fonctionnalités principales",
      priority: "must",
      complexity: 3,
      impact: 4,
      inMvp: true
    },
    {
      id: "3",
      name: "Analytiques avancées",
      description: "Graphiques et rapports détaillés",
      priority: "could",
      complexity: 4,
      impact: 3,
      inMvp: false
    }
  ]);
  
  const [newFeature, setNewFeature] = useState<Omit<Feature, 'id'>>({
    name: "",
    description: "",
    priority: "should",
    complexity: 3,
    impact: 3,
    inMvp: false
  });

  const addFeature = () => {
    if (!newFeature.name.trim()) return;
    
    const id = (Math.max(0, ...features.map(f => parseInt(f.id))) + 1).toString();
    
    setFeatures([...features, {
      ...newFeature,
      id
    }]);
    
    // Reset form
    setNewFeature({
      name: "",
      description: "",
      priority: "should",
      complexity: 3,
      impact: 3,
      inMvp: false
    });
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const updateFeature = (id: string, field: keyof Feature, value: any) => {
    setFeatures(features.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const handleNewFeatureChange = (field: keyof Omit<Feature, 'id'>, value: any) => {
    setNewFeature({
      ...newFeature,
      [field]: value
    });
  };

  const getPriorityLabel = (priority: Feature['priority']) => {
    switch (priority) {
      case 'must': return 'Must have';
      case 'should': return 'Should have';
      case 'could': return 'Could have';
      case 'wont': return 'Won\'t have';
      default: return '';
    }
  };

  const getPriorityColor = (priority: Feature['priority']) => {
    switch (priority) {
      case 'must': return 'text-red-500';
      case 'should': return 'text-amber-500';
      case 'could': return 'text-blue-500';
      case 'wont': return 'text-gray-500';
      default: return '';
    }
  };

  const mvpFeatures = features.filter(f => f.inMvp);
  const nonMvpFeatures = features.filter(f => !f.inMvp);

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="mvp_selector"
      title="Sélecteur de MVP (Minimum Viable Product)"
      description="Définissez et priorisez les fonctionnalités de votre MVP"
      defaultValues={{ features }}
      onDataSaved={data => {
        if (data.features) setFeatures(data.features);
      }}
    >
      <div className="space-y-8">
        {/* Liste des fonctionnalités */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Liste des fonctionnalités</h3>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="text-center">Impact</TableHead>
                  <TableHead className="text-center">Complexité</TableHead>
                  <TableHead className="text-center">MVP</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map(feature => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-sm text-muted-foreground">{feature.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={feature.priority}
                        onChange={(e) => updateFeature(feature.id, 'priority', e.target.value)}
                        className={`bg-transparent border-none ${getPriorityColor(feature.priority as Feature['priority'])}`}
                      >
                        <option value="must">Must have</option>
                        <option value="should">Should have</option>
                        <option value="could">Could have</option>
                        <option value="wont">Won't have</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <select
                        value={feature.impact}
                        onChange={(e) => updateFeature(feature.id, 'impact', parseInt(e.target.value))}
                        className="bg-transparent border-none"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <select
                        value={feature.complexity}
                        onChange={(e) => updateFeature(feature.id, 'complexity', parseInt(e.target.value))}
                        className="bg-transparent border-none"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={feature.inMvp}
                        onCheckedChange={(checked) => updateFeature(feature.id, 'inMvp', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFeature(feature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Ajouter une fonctionnalité */}
        <div className="p-4 border rounded-md">
          <h3 className="text-md font-medium mb-4">Ajouter une fonctionnalité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="featureName">Nom de la fonctionnalité</Label>
              <Input
                id="featureName"
                placeholder="Ex: Module de paiement"
                value={newFeature.name}
                onChange={(e) => handleNewFeatureChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="featurePriority">Priorité</Label>
              <select
                id="featurePriority"
                value={newFeature.priority}
                onChange={(e) => handleNewFeatureChange('priority', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="must">Must have</option>
                <option value="should">Should have</option>
                <option value="could">Could have</option>
                <option value="wont">Won't have</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="featureDescription">Description</Label>
            <Input
              id="featureDescription"
              placeholder="Décrivez brièvement cette fonctionnalité"
              value={newFeature.description}
              onChange={(e) => handleNewFeatureChange('description', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="featureImpact">Impact (1-5)</Label>
              <select
                id="featureImpact"
                value={newFeature.impact}
                onChange={(e) => handleNewFeatureChange('impact', parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="featureComplexity">Complexité (1-5)</Label>
              <select
                id="featureComplexity"
                value={newFeature.complexity}
                onChange={(e) => handleNewFeatureChange('complexity', parseInt(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featureMvp"
                  checked={newFeature.inMvp}
                  onCheckedChange={(checked) => handleNewFeatureChange('inMvp', checked === true)}
                />
                <Label htmlFor="featureMvp">Inclure dans MVP</Label>
              </div>
            </div>
          </div>
          
          <Button onClick={addFeature} disabled={!newFeature.name.trim()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter la fonctionnalité
          </Button>
        </div>

        {/* Résumé du MVP */}
        <div>
          <h3 className="text-lg font-medium mb-4">Résumé du MVP</h3>
          
          <div className="p-4 border rounded-md bg-primary/5">
            <div className="mb-4">
              <span className="text-sm font-medium">Fonctionnalités incluses dans le MVP: </span>
              <span className="text-lg font-bold">{mvpFeatures.length}</span>
              <span className="text-sm text-muted-foreground"> sur {features.length} totales</span>
            </div>
            
            {mvpFeatures.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm">Fonctionnalités incluses:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {mvpFeatures.map(f => (
                    <li key={f.id} className="text-sm">
                      <span className="font-medium">{f.name}</span>
                      <span className={`ml-2 text-xs ${getPriorityColor(f.priority)}`}>
                        ({getPriorityLabel(f.priority)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {nonMvpFeatures.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Pour les versions futures:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {nonMvpFeatures.map(f => (
                    <li key={f.id} className="text-sm text-muted-foreground">
                      <span>{f.name}</span>
                      <span className={`ml-2 text-xs ${getPriorityColor(f.priority)}`}>
                        ({getPriorityLabel(f.priority)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResourceForm>
  );
}
