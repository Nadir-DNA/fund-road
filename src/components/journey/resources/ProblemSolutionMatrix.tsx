
import { useState } from "react";
import ResourceForm from "../ResourceForm";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      defaultValues={formData}
      onDataSaved={data => setFormData(data)}
    >
      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Proposition de valeur globale</Label>
          <Textarea 
            placeholder="Comment résumeriez-vous votre proposition de valeur en une phrase?"
            className="mt-2"
            value={formData.value_proposition}
            onChange={(e) => handleChange('value_proposition', e.target.value)}
          />
        </div>

        <div>
          <Label className="text-base font-medium">Segment d'utilisateurs ciblé</Label>
          <Textarea 
            placeholder="Décrivez précisément le segment d'utilisateurs visé par votre solution"
            className="mt-2"
            value={formData.target_users}
            onChange={(e) => handleChange('target_users', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-3">
            <h3 className="font-semibold">Problèmes et solutions</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Identifiez les 3 principaux problèmes et les solutions correspondantes
            </p>
          </div>

          {/* Headers */}
          <div className="hidden md:block font-medium">Problème</div>
          <div className="hidden md:block font-medium">Solution proposée</div>
          <div className="hidden md:block font-medium">Méthode de validation</div>

          {/* Row 1 */}
          <div>
            <Label className="md:hidden mb-1 block">Problème 1</Label>
            <Textarea 
              placeholder="Premier problème identifié"
              value={formData.problem1}
              onChange={(e) => handleChange('problem1', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Solution 1</Label>
            <Textarea 
              placeholder="Solution au premier problème"
              value={formData.problem1_solution}
              onChange={(e) => handleChange('problem1_solution', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Validation 1</Label>
            <Textarea 
              placeholder="Comment valider cette solution?"
              value={formData.problem1_validation}
              onChange={(e) => handleChange('problem1_validation', e.target.value)}
            />
          </div>

          {/* Row 2 */}
          <div>
            <Label className="md:hidden mb-1 block">Problème 2</Label>
            <Textarea 
              placeholder="Deuxième problème identifié"
              value={formData.problem2}
              onChange={(e) => handleChange('problem2', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Solution 2</Label>
            <Textarea 
              placeholder="Solution au deuxième problème"
              value={formData.problem2_solution}
              onChange={(e) => handleChange('problem2_solution', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Validation 2</Label>
            <Textarea 
              placeholder="Comment valider cette solution?"
              value={formData.problem2_validation}
              onChange={(e) => handleChange('problem2_validation', e.target.value)}
            />
          </div>

          {/* Row 3 */}
          <div>
            <Label className="md:hidden mb-1 block">Problème 3</Label>
            <Textarea 
              placeholder="Troisième problème identifié"
              value={formData.problem3}
              onChange={(e) => handleChange('problem3', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Solution 3</Label>
            <Textarea 
              placeholder="Solution au troisième problème"
              value={formData.problem3_solution}
              onChange={(e) => handleChange('problem3_solution', e.target.value)}
            />
          </div>
          <div>
            <Label className="md:hidden mb-1 block">Validation 3</Label>
            <Textarea 
              placeholder="Comment valider cette solution?"
              value={formData.problem3_validation}
              onChange={(e) => handleChange('problem3_validation', e.target.value)}
            />
          </div>
        </div>
      </div>
    </ResourceForm>
  );
}
