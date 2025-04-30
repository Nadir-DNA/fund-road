
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface PerceptionSectionProps {
  thinksSays: string;
  does: string;
  feels: string;
  hears: string;
  sees: string;
  onChange: (field: string, value: string) => void;
}

export function PerceptionSection({ 
  thinksSays, 
  does, 
  feels,
  hears,
  sees,
  onChange 
}: PerceptionSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">Perceptions et comportements</h3>
      
      {/* THINKS & SAYS */}
      <div className="p-5 border rounded-md bg-blue-50/10">
        <Label className="font-medium mb-3 block">Pense et dit</Label>
        <Textarea 
          placeholder="Que pense et dit votre persona ?"
          className="min-h-[150px]"
          value={thinksSays}
          onChange={(e) => onChange('thinks_says', e.target.value)}
        />
      </div>

      {/* DOES */}
      <div className="p-5 border rounded-md bg-amber-50/10">
        <Label className="font-medium mb-3 block">Fait</Label>
        <Textarea 
          placeholder="Que fait votre persona ? Quelles actions ?"
          className="min-h-[150px]"
          value={does}
          onChange={(e) => onChange('does', e.target.value)}
        />
      </div>

      {/* FEELS */}
      <div className="p-5 border rounded-md bg-red-50/10">
        <Label className="font-medium mb-3 block">Ressent</Label>
        <Textarea 
          placeholder="Quelles émotions ressent votre persona ?"
          className="min-h-[150px]"
          value={feels}
          onChange={(e) => onChange('feels', e.target.value)}
        />
      </div>

      {/* HEARS */}
      <div className="p-5 border rounded-md bg-purple-50/10">
        <Label className="font-medium mb-3 block">Entend</Label>
        <Textarea 
          placeholder="Qu'entend votre persona dans son environnement ?"
          className="min-h-[150px]"
          value={hears}
          onChange={(e) => onChange('hears', e.target.value)}
        />
      </div>

      {/* SEES */}
      <div className="p-5 border rounded-md bg-emerald-50/10">
        <Label className="font-medium mb-3 block">Voit</Label>
        <Textarea 
          placeholder="Que voit votre persona dans son environnement ?"
          className="min-h-[150px]"
          value={sees}
          onChange={(e) => onChange('sees', e.target.value)}
        />
      </div>
    </div>
  );
}
