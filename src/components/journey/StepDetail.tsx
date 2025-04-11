
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResourceManager from "./ResourceManager";
import OverviewTab from "./OverviewTab";
import HelpTab from "./HelpTab";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedSubStep ? "resources" : "overview");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          {selectedSubStep ? selectedSubStep.description : step.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab 
            step={step} 
            selectedSubStep={selectedSubStep} 
            isLoading={isLoading}
            courseContent=""
          />
        </TabsContent>
        
        <TabsContent value="resources" className="py-4">
          <ResourceManager 
            step={step} 
            selectedSubstepTitle={selectedSubStep?.title}
          />
        </TabsContent>
        
        <TabsContent value="help">
          <HelpTab resources={step.resources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
