
import { useState, useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResourceManager from "./ResourceManager";
import OverviewTab from "./OverviewTab";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

interface CourseContentResult {
  course_content: string;
  substep_title?: string | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResourceName = searchParams.get('resource');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(selectedResourceName ? "resources" : "overview");
  
  // If there's a resource param in the URL, switch to resources tab
  useEffect(() => {
    if (selectedResourceName) {
      setActiveTab("resources");
    }
  }, [selectedResourceName]);
  
  // Handle back navigation
  useEffect(() => {
    const handleBackNavigation = () => {
      // Check if we should go back to a previous resource path
      const returnPath = getResourceReturnPath();
      if (returnPath) {
        clearResourceReturnPath();
        navigate(returnPath);
      }
    };
    
    window.addEventListener('popstate', handleBackNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [navigate]);
  
  // Fetch course content for the selected step/substep with optimized query
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title],
    queryFn: async () => {
      try {
        // Check auth session first
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session.session) {
          // Don't show error toast here, let the component handle authentication
          return "";
        }
        
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
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger le contenu du cours.",
          variant: "destructive"
        });
        return "";
      }
    },
    staleTime: 1000 * 60 * 5, // Cache content for 5 minutes
    retry: 1
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL if switching between resources and overview tab
    if (value === "resources" && !selectedResourceName) {
      // We're switching to resources but no resource is selected in URL
      // Do nothing with URL here
    } else if (value === "overview" && selectedResourceName) {
      // We're switching to overview but resource is in the URL
      // Remove resource from URL without affecting other params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('resource');
      setSearchParams(newParams, { replace: true }); // Use replace to avoid adding to history
    }
  };

  // Handle dialog close - cleanup URL params
  const handleDialogClose = () => {
    // Remove all params and navigate to /roadmap
    navigate('/roadmap', { replace: true });
  };

  return (
    <div className="px-2 w-full">
      <DialogHeader className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl sm:text-2xl">{step.title}</DialogTitle>
          <DialogClose asChild onClick={handleDialogClose}>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription className="text-sm sm:text-base mt-2">
          {selectedSubStep ? selectedSubStep.description : step.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Cours</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm">Ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {isLoadingContent ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingIndicator size="lg" className="mb-4" />
              <p className="text-muted-foreground">Chargement du contenu...</p>
            </div>
          ) : (
            <OverviewTab 
              step={step} 
              selectedSubStep={selectedSubStep} 
              isLoading={false}
              courseContent={courseContent || ""}
            />
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="py-4">
          <ResourceManager 
            step={step} 
            selectedSubstepTitle={selectedSubStep?.title}
            selectedResourceName={selectedResourceName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
