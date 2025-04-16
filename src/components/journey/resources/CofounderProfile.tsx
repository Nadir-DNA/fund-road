import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface CofounderProfileProps {
  stepId: number;
  substepTitle: string;
}

interface Cofounder {
  name: string;
  role: string;
  skills: string;
  contribution: string;
  expectations: string;
}

export default function CofounderProfile({ stepId, substepTitle }: CofounderProfileProps) {
  const [formData, setFormData] = useState<Cofounder[]>([
    { name: "", role: "", skills: "", contribution: "", expectations: "" }
  ]);

  const handleChange = (index: number, field: keyof Cofounder, value: string) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const addCofounder = () => {
    setFormData(prev => [...prev, { name: "", role: "", skills: "", contribution: "", expectations: "" }]);
  };

  return (
    <ResourceForm
      stepId={stepId}
      substepTitle={substepTitle}
      resourceType="cofounder_profile"
      title="Fiche cofondateur"
      description="Renseignez le profil et les apports de chaque cofondateur pour cadrer votre équipe de départ."
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-4">
        {formData.map((cofounder, index) => (
          <Card key={index} className="p-4 space-y-2">
            <div>
              <Label>Nom</Label>
              <Input
                placeholder="Ex : Marie Dupont"
                value={cofounder.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>
            <div>
              <Label>Rôle dans le projet</Label>
              <Input
                placeholder="Ex : CTO, CEO, Produit..."
                value={cofounder.role}
                onChange={(e) => handleChange(index, "role", e.target.value)}
              />
            </div>
            <div>
              <Label>Compétences clés</Label>
              <Textarea
                placeholder="Ex : Développement web, finance, growth hacking..."
                value={cofounder.skills}
                onChange={(e) => handleChange(index, "skills", e.target.value)}
              />
            </div>
            <div>
              <Label>Apport au projet</Label>
              <Textarea
                placeholder="Temps, argent, réseau, outils, etc."
                value={cofounder.contribution}
                onChange={(e) => handleChange(index, "contribution", e.target.value)}
              />
            </div>
            <div>
              <Label>Attentes ou besoins</Label>
              <Textarea
                placeholder="Ce qu’il ou elle attend du projet (perspectives, salaire, liberté...)"
                value={cofounder.expectations}
                onChange={(e) => handleChange(index, "expectations", e.target.value)}
              />
            </div>
          </Card>
        ))}
        <button onClick={addCofounder} className="text-sm mt-2 text-blue-600 hover:underline">
          ➕ Ajouter un cofondateur
        </button>
      </div>
    </ResourceForm>
  );
}
