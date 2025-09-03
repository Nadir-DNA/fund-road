
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MotivationsSectionProps {
  pains: string;
  goals: string;
  gains: string;
  onChange: (field: string, value: string) => void;
}

export function MotivationsSection({ pains, goals, gains, onChange }: MotivationsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">Motivations et freins</h3>
      
      {/* OBSTACLES / PAINS */}
      <div className="p-5 border rounded-md bg-red-50/10">
        <Label className="font-medium mb-3 block">Obstacles / Douleurs</Label>
        <Textarea 
          placeholder="Quels sont ses frustrations et difficultés ?"
          className="min-h-[150px]"
          value={pains}
          onChange={(e) => onChange('pains', e.target.value)}
        />
      </div>

      {/* OBJECTIFS */}
      <div className="p-5 border rounded-md bg-amber-50/10">
        <Label className="font-medium mb-3 block">Objectifs</Label>
        <Textarea 
          placeholder="Que cherche-t-il/elle à accomplir ?"
          className="min-h-[150px]"
          value={goals}
          onChange={(e) => onChange('goals', e.target.value)}
        />
      </div>

      {/* BÉNÉFICES / GAINS */}
      <div className="p-5 border rounded-md bg-emerald-50/10">
        <Label className="font-medium mb-3 block">Bénéfices recherchés</Label>
        <Textarea 
          placeholder="Quels avantages recherche-t-il/elle ?"
          className="min-h-[150px]"
          value={gains}
          onChange={(e) => onChange('gains', e.target.value)}
        />
      </div>
    </div>
  );
}
