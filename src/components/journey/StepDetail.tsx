
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import ResourceManager from "./ResourceManager";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="px-2">
      <DialogHeader className="mb-6">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription>
          {step.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="py-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description détaillée</h3>
              <p className="text-muted-foreground">{step.detailedDescription}</p>
            </div>
            
            {selectedSubStep ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Sous-étape sélectionnée</h3>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">{selectedSubStep.title}</h4>
                  <p className="text-muted-foreground mt-1">{selectedSubStep.description}</p>
                </div>
              </div>
            ) : step.subSteps && step.subSteps.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Sous-étapes</h3>
                <div className="space-y-3">
                  {step.subSteps.map((subStep, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{subStep.title}</h4>
                      <p className="text-muted-foreground mt-1">{subStep.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="py-4">
          <ResourceManager 
            step={step} 
            selectedSubstepTitle={selectedSubStep?.title}
          />
        </TabsContent>
        
        <TabsContent value="help" className="py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ressources d'aide</h3>
            <p className="text-muted-foreground">
              Consultez ces ressources pour vous aider à compléter cette étape de votre parcours entrepreneurial.
            </p>
            
            {step.resources && step.resources.length > 0 ? (
              <div className="space-y-3 mt-4">
                {step.resources.map((resource, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{resource.description}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Accéder à la ressource
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border rounded-lg text-center text-muted-foreground">
                Aucune ressource d'aide supplémentaire n'est disponible pour le moment.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
