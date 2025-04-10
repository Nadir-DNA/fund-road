
import { useParams } from "react-router-dom";
import { Step } from "@/types/journey";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProblemSolutionMatrix from "./resources/ProblemSolutionMatrix";
import BusinessModelCanvas from "./resources/BusinessModelCanvas";
import SWOTAnalysis from "./resources/SWOTAnalysis";
import CapTable from "./resources/CapTable";
import EmpathyMap from "./resources/EmpathyMap";
import MVPSelector from "./resources/MVPSelector";

interface ResourceManagerProps {
  step: Step;
  selectedSubstepTitle?: string;
}

export default function ResourceManager({ step, selectedSubstepTitle }: ResourceManagerProps) {
  // Déterminer quelle ressource afficher en fonction de l'étape et de la sous-étape
  const renderResource = (stepId: number, substepTitle: string) => {
    // Phase 1: Idéation
    if (stepId === 1) {
      if (substepTitle === "Identification des besoins ou problèmes") {
        return <EmpathyMap stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Phase 2: Validation du concept
    if (stepId === 2) {
      if (substepTitle === "Construction du problème-solution fit") {
        return <ProblemSolutionMatrix stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Phase 3: Business Model
    if (stepId === 3) {
      if (substepTitle === "Création du Business Model Canvas") {
        return <BusinessModelCanvas stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Phase 4: Développement
    if (stepId === 4) {
      if (substepTitle === "Définition du MVP") {
        return <MVPSelector stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Phase 6: Business Plan
    if (stepId === 6) {
      if (substepTitle === "Annexes clés") {
        return <SWOTAnalysis stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Phase 8: Financement
    if (stepId === 8) {
      if (substepTitle === "Outils d'aide à la levée") {
        return <CapTable stepId={stepId} substepTitle={substepTitle} />;
      }
    }
    
    // Si aucune ressource spécifique n'est définie, afficher un message
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Aucune ressource interactive n'est actuellement disponible pour cette section.
            <br />
            De nouvelles ressources seront ajoutées prochainement.
          </p>
        </CardContent>
      </Card>
    );
  };

  // Si aucune sous-étape n'est sélectionnée et que l'étape a des sous-étapes, afficher la liste des sous-étapes
  if (!selectedSubstepTitle && step.subSteps && step.subSteps.length > 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Ressources disponibles</h3>
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="resources">Ressources interactives</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="resources" className="space-y-6">
            {step.subSteps.map((subStep) => (
              <div key={subStep.title} className="mb-6">
                <h4 className="text-md font-medium mb-4">{subStep.title}</h4>
                {renderResource(step.id, subStep.title)}
              </div>
            ))}
          </TabsContent>
          <TabsContent value="templates">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Des modèles de documents et templates à télécharger seront disponibles prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Si une sous-étape est sélectionnée, afficher la ressource correspondante
  if (selectedSubstepTitle) {
    return (
      <div className="mt-6">
        {renderResource(step.id, selectedSubstepTitle)}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">
          Sélectionnez une sous-étape pour accéder aux ressources associées.
        </p>
      </CardContent>
    </Card>
  );
}
