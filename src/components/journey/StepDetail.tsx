
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

interface CourseContentResult {
  course_content: string;
  substep_title?: string | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedSubStep ? "resources" : "overview");
  
  // Fetch course content for the selected step/substep with optimized query
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('course_content, substep_title')
          .eq('step_id', step.id);
        
        if (error) throw error;
        
        // Filter for the specific substep if one is selected
        let content = "";
        if (data && data.length > 0) {
          if (selectedSubStep) {
            const substepContent = data.find((item: CourseContentResult) => 
              item.substep_title === selectedSubStep.title
            );
            content = substepContent?.course_content || "";
          } else {
            const stepContent = data.find((item: CourseContentResult) => 
              !item.substep_title || item.substep_title === step.title
            );
            content = stepContent?.course_content || "";
          }
        }
        
        return content;
      } catch (err) {
        console.error("Error fetching course content:", err);
        return "";
      }
    },
    staleTime: 1000 * 60 * 5, // Cache content for 5 minutes
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
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Cours</TabsTrigger>
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
