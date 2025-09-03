
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ProblemSolutionMatrixProps {
  stepId: number;
  substepTitle: string;
}

export default function ProblemSolutionMatrix({ stepId, substepTitle }: ProblemSolutionMatrixProps) {
  const [formData, setFormData] = useState({
    problem1: "",
    problem2: "",
    problem3: "",
    problem1_solution: "",
    problem2_solution: "",
    problem3_solution: "",
    problem1_validation: "",
    problem2_validation: "",
    problem3_validation: "",
    target_users: "",
    value_proposition: ""
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
      resourceType="problem_solution_matrix"
      title="Matrice Problème-Solution"
      description="Identifiez les principaux problèmes de vos utilisateurs et les solutions que vous apportez"
      formData={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <div className="p-4 border rounded-md bg-primary/5">
          <Label className="text-base font-medium mb-3 block">Proposition de valeur globale</Label>
          <Textarea 
            placeholder="Comment résumeriez-vous votre proposition de valeur en une phrase?"
            className="mt-2"
            value={formData.value_proposition}
            onChange={(e) => handleChange('value_proposition', e.target.value)}
          />
        </div>

        <div className="p-4 border rounded-md bg-blue-50/10">
          <Label className="text-base font-medium mb-3 block">Segment d'utilisateurs ciblé</Label>
          <Textarea 
            placeholder="Décrivez précisément le segment d'utilisateurs visé par votre solution"
            className="mt-2"
            value={formData.target_users}
            onChange={(e) => handleChange('target_users', e.target.value)}
          />
        </div>
        
        <div className="space-y-8 mt-6">
          <h3 className="font-medium text-lg">Problèmes et solutions</h3>
          
          {/* Premier problème */}
          <Card className="p-5 bg-amber-50/5">
            <h4 className="font-medium mb-4 border-l-4 border-amber-500 pl-3">Problème 1</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1 block">Description du problème</Label>
                <Textarea 
                  placeholder="Premier problème identifié"
                  className="min-h-[100px]"
                  value={formData.problem1}
                  onChange={(e) => handleChange('problem1', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Solution proposée</Label>
                <Textarea 
                  placeholder="Solution au premier problème"
                  className="min-h-[100px]"
                  value={formData.problem1_solution}
                  onChange={(e) => handleChange('problem1_solution', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Méthode de validation</Label>
                <Textarea 
                  placeholder="Comment valider cette solution?"
                  className="min-h-[80px]"
                  value={formData.problem1_validation}
                  onChange={(e) => handleChange('problem1_validation', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Deuxième problème */}
          <Card className="p-5 bg-amber-50/5">
            <h4 className="font-medium mb-4 border-l-4 border-amber-500 pl-3">Problème 2</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1 block">Description du problème</Label>
                <Textarea 
                  placeholder="Deuxième problème identifié"
                  className="min-h-[100px]"
                  value={formData.problem2}
                  onChange={(e) => handleChange('problem2', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Solution proposée</Label>
                <Textarea 
                  placeholder="Solution au deuxième problème"
                  className="min-h-[100px]"
                  value={formData.problem2_solution}
                  onChange={(e) => handleChange('problem2_solution', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Méthode de validation</Label>
                <Textarea 
                  placeholder="Comment valider cette solution?"
                  className="min-h-[80px]"
                  value={formData.problem2_validation}
                  onChange={(e) => handleChange('problem2_validation', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Troisième problème */}
          <Card className="p-5 bg-amber-50/5">
            <h4 className="font-medium mb-4 border-l-4 border-amber-500 pl-3">Problème 3</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1 block">Description du problème</Label>
                <Textarea 
                  placeholder="Troisième problème identifié"
                  className="min-h-[100px]"
                  value={formData.problem3}
                  onChange={(e) => handleChange('problem3', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Solution proposée</Label>
                <Textarea 
                  placeholder="Solution au troisième problème"
                  className="min-h-[100px]"
                  value={formData.problem3_solution}
                  onChange={(e) => handleChange('problem3_solution', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-1 block">Méthode de validation</Label>
                <Textarea 
                  placeholder="Comment valider cette solution?"
                  className="min-h-[80px]"
                  value={formData.problem3_validation}
                  onChange={(e) => handleChange('problem3_validation', e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ResourceForm>
  );
}
