
import { useState } from "react";
import { Step, SubStep } from "@/types/journey";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResourceManager from "./ResourceManager";
import OverviewTab from "./OverviewTab";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedSubStep ? "resources" : "overview");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch course content for the selected step/substep
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepreneur_resources')
        .select('course_content')
        .eq('step_id', step.id)
        .eq('substep_title', selectedSubStep ? selectedSubStep.title : step.title)
        .single();
        
      if (error) {
        console.error("Error fetching course content:", error);
        return "";
      }
      
      return data?.course_content || "";
    }
  });

  return (
    <div className="px-2 w-full">
      <DialogHeader className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl sm:text-2xl">{step.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription className="text-sm sm:text-base mt-2">
          {selectedSubStep ? selectedSubStep.description : step.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Aperçu</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewTab 
            step={step} 
            selectedSubStep={selectedSubStep} 
            isLoading={isLoadingContent}
            courseContent={courseContent || ""}
          />
        </TabsContent>
        
        <TabsContent value="resources" className="py-4">
          <ResourceManager 
            step={step} 
            selectedSubstepTitle={selectedSubStep?.title}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
