
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PersonaSectionProps {
  personaName: string;
  personaRole: string;
  personaAge: string;
  onChange: (field: string, value: string) => void;
}

export function PersonaSection({ personaName, personaRole, personaAge, onChange }: PersonaSectionProps) {
  return (
    <Card className="p-5 border rounded-md mb-6">
      <h3 className="text-lg font-medium mb-4">Définition du Persona</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="persona_name">Nom</Label>
          <Input
            id="persona_name"
            placeholder="Ex: Marie D."
            value={personaName}
            onChange={(e) => onChange('persona_name', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="persona_role">Rôle / Profession</Label>
          <Input
            id="persona_role"
            placeholder="Ex: Directrice Marketing"
            value={personaRole}
            onChange={(e) => onChange('persona_role', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="persona_age">Âge</Label>
          <Input
            id="persona_age"
            placeholder="Ex: 35"
            value={personaAge}
            onChange={(e) => onChange('persona_age', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </Card>
  );
}
