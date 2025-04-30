
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PerceptionSectionProps {
  thinksSays: string;
  does: string;
  hears: string;
  sees: string;
  onChange: (field: string, value: string) => void;
}

export function PerceptionSection({ thinksSays, does, hears, sees, onChange }: PerceptionSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg">Ce que le persona perçoit</h3>
      
      {/* Ce que le persona PENSE et DIT */}
      <div className="p-5 border rounded-md bg-blue-50/10">
        <Label className="font-medium mb-3 block">Ce qu'il/elle pense et dit</Label>
        <Textarea 
          placeholder="Quelles sont ses réflexions et ses expressions verbales ?"
          className="min-h-[150px]"
          value={thinksSays}
          onChange={(e) => onChange('thinks_says', e.target.value)}
        />
      </div>

      {/* Ce que le persona FAIT */}
      <div className="p-5 border rounded-md bg-green-50/10">
        <Label className="font-medium mb-3 block">Ce qu'il/elle fait</Label>
        <Textarea 
          placeholder="Quels sont ses comportements et ses actions ?"
          className="min-h-[150px]"
          value={does}
          onChange={(e) => onChange('does', e.target.value)}
        />
      </div>

      {/* Ce que le persona ENTEND */}
      <div className="p-5 border rounded-md bg-yellow-50/10">
        <Label className="font-medium mb-3 block">Ce qu'il/elle entend</Label>
        <Textarea 
          placeholder="Quelles influences reçoit-il/elle de son entourage ?"
          className="min-h-[150px]"
          value={hears}
          onChange={(e) => onChange('hears', e.target.value)}
        />
      </div>

      {/* Ce que le persona VOIT */}
      <div className="p-5 border rounded-md bg-purple-50/10">
        <Label className="font-medium mb-3 block">Ce qu'il/elle voit</Label>
        <Textarea 
          placeholder="À quel environnement est-il/elle exposé(e) ?"
          className="min-h-[150px]"
          value={sees}
          onChange={(e) => onChange('sees', e.target.value)}
        />
      </div>
    </div>
  );
}
