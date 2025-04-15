
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface EmpathyMapProps {
  stepId: number;
  substepTitle: string;
}

export default function EmpathyMap({ stepId, substepTitle }: EmpathyMapProps) {
  const [formData, setFormData] = useState({
    persona_name: "",
    persona_role: "",
    persona_age: "",
    thinks_says: "",
    does: "",
    feels: "",
    hears: "",
    sees: "",
    pains: "",
    gains: "",
    goals: ""
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
      resourceType="empathy_map"
      title="Carte d'Empathie Utilisateur"
      description="Développez une compréhension profonde des utilisateurs de votre solution"
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-8">
        <Card className="p-5 border rounded-md mb-6">
          <h3 className="text-lg font-medium mb-4">Définition du Persona</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="persona_name">Nom</Label>
              <Input
                id="persona_name"
                placeholder="Ex: Marie D."
                value={formData.persona_name}
                onChange={(e) => handleChange('persona_name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="persona_role">Rôle / Profession</Label>
              <Input
                id="persona_role"
                placeholder="Ex: Directrice Marketing"
                value={formData.persona_role}
                onChange={(e) => handleChange('persona_role', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="persona_age">Âge</Label>
              <Input
                id="persona_age"
                placeholder="Ex: 35"
                value={formData.persona_age}
                onChange={(e) => handleChange('persona_age', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h3 className="font-medium text-lg">Ce que le persona perçoit</h3>
          
          {/* Ce que le persona PENSE et DIT */}
          <div className="p-5 border rounded-md bg-blue-50/10">
            <Label className="font-medium mb-3 block">Ce qu'il/elle pense et dit</Label>
            <Textarea 
              placeholder="Quelles sont ses réflexions et ses expressions verbales ?"
              className="min-h-[150px]"
              value={formData.thinks_says}
              onChange={(e) => handleChange('thinks_says', e.target.value)}
            />
          </div>

          {/* Ce que le persona FAIT */}
          <div className="p-5 border rounded-md bg-green-50/10">
            <Label className="font-medium mb-3 block">Ce qu'il/elle fait</Label>
            <Textarea 
              placeholder="Quels sont ses comportements et ses actions ?"
              className="min-h-[150px]"
              value={formData.does}
              onChange={(e) => handleChange('does', e.target.value)}
            />
          </div>

          {/* Ce que le persona ENTEND */}
          <div className="p-5 border rounded-md bg-yellow-50/10">
            <Label className="font-medium mb-3 block">Ce qu'il/elle entend</Label>
            <Textarea 
              placeholder="Quelles influences reçoit-il/elle de son entourage ?"
              className="min-h-[150px]"
              value={formData.hears}
              onChange={(e) => handleChange('hears', e.target.value)}
            />
          </div>

          {/* Ce que le persona VOIT */}
          <div className="p-5 border rounded-md bg-purple-50/10">
            <Label className="font-medium mb-3 block">Ce qu'il/elle voit</Label>
            <Textarea 
              placeholder="À quel environnement est-il/elle exposé(e) ?"
              className="min-h-[150px]"
              value={formData.sees}
              onChange={(e) => handleChange('sees', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-medium text-lg">Motivations et freins</h3>
          
          {/* OBSTACLES / PAINS */}
          <div className="p-5 border rounded-md bg-red-50/10">
            <Label className="font-medium mb-3 block">Obstacles / Douleurs</Label>
            <Textarea 
              placeholder="Quels sont ses frustrations et difficultés ?"
              className="min-h-[150px]"
              value={formData.pains}
              onChange={(e) => handleChange('pains', e.target.value)}
            />
          </div>

          {/* OBJECTIFS */}
          <div className="p-5 border rounded-md bg-amber-50/10">
            <Label className="font-medium mb-3 block">Objectifs</Label>
            <Textarea 
              placeholder="Que cherche-t-il/elle à accomplir ?"
              className="min-h-[150px]"
              value={formData.goals}
              onChange={(e) => handleChange('goals', e.target.value)}
            />
          </div>

          {/* BÉNÉFICES / GAINS */}
          <div className="p-5 border rounded-md bg-emerald-50/10">
            <Label className="font-medium mb-3 block">Bénéfices recherchés</Label>
            <Textarea 
              placeholder="Quels avantages recherche-t-il/elle ?"
              className="min-h-[150px]"
              value={formData.gains}
              onChange={(e) => handleChange('gains', e.target.value)}
            />
          </div>
        </div>
      </div>
    </ResourceForm>
  );
}
