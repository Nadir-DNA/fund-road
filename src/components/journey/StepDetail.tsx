import { useEffect } from "react";
import { Step, SubStep } from "@/types/journey";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResourceManager from "./ResourceManager";
import OverviewTab from "./OverviewTab";
import StepHeader from "./step-detail/StepHeader";
import { useStepTabs } from "@/hooks/useStepTabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { toast } from "@/components/ui/use-toast";
import { getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [searchParams] = useSearchParams();
  const selectedResourceName = searchParams.get('resource');
  const navigate = useNavigate();
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName);

  // Handle back navigation
  useEffect(() => {
    const handleBackNavigation = () => {
      const returnPath = getResourceReturnPath();
      if (returnPath) {
        clearResourceReturnPath();
        navigate(returnPath);
      }
    };
    
    window.addEventListener('popstate', handleBackNavigation);
    return () => window.removeEventListener('popstate', handleBackNavigation);
  }, [navigate]);

  // Fetch course content with improved error handling and more detailed query
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("No authenticated session found");
          return "";
        }
        
        // Log fetch attempt with clear parameters
        console.log(`Fetching course content for step ID: ${step.id}, substep: ${selectedSubStep?.title || 'main step'}`);
        
        // Simplified query to get all relevant resources for this step
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id);
        
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} resource records from Supabase`);
        console.log("Resources data:", data);
        
        let content = "";
        
        // Process retrieved data
        if (data && data.length > 0) {
          // Find content specifically for a substep if selected
          if (selectedSubStep) {
            // Try to find course content for this specific substep
            // First look for resources marked as 'course' type
            const substepCourse = data.find(item => 
              item.substep_title === selectedSubStep.title && 
              item.resource_type === 'course'
            );
            
            // If found with 'course' type, use it
            if (substepCourse?.course_content) {
              console.log(`Found course content for substep "${selectedSubStep.title}" with resource_type "course"`);
              content = substepCourse.course_content;
            } else {
              // Otherwise try to find any content for this substep
              const anySubstepContent = data.find(item => 
                item.substep_title === selectedSubStep.title && 
                item.course_content
              );
              
              if (anySubstepContent?.course_content) {
                console.log(`Found content for substep "${selectedSubStep.title}" with alternative resource_type`);
                content = anySubstepContent.course_content;
              } else {
                console.log(`No specific course content found for substep: "${selectedSubStep.title}"`);
              }
            }
          } else {
            // Try to find content for the main step
            // First look for resources marked as 'course' type with no substep
            const mainStepCourse = data.find(item => 
              (!item.substep_title || item.substep_title === step.title) && 
              item.resource_type === 'course'
            );
            
            // If found with 'course' type, use it
            if (mainStepCourse?.course_content) {
              console.log(`Found course content for main step "${step.title}" with resource_type "course"`);
              content = mainStepCourse.course_content;
            } else {
              // Otherwise try to find any content for the main step
              const anyMainContent = data.find(item => 
                (!item.substep_title || item.substep_title === step.title) && 
                item.course_content
              );
              
              if (anyMainContent?.course_content) {
                console.log(`Found content for main step "${step.title}" with alternative resource_type`);
                content = anyMainContent.course_content;
              } else {
                console.log(`No specific course content found for main step: "${step.title}"`);
              }
            }
          }
        } else {
          console.log(`No resources found for step ID: ${step.id}`);
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3 // Increase retry attempts
  });

  const handleDialogClose = () => {
    navigate('/roadmap', { replace: true });
  };

  return (
    <div className="px-2 w-full">
      <StepHeader 
        step={step} 
        selectedSubStep={selectedSubStep}
        onClose={handleDialogClose}
      />

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
          ) : courseContent ? (
            <OverviewTab 
              step={step} 
              selectedSubStep={selectedSubStep} 
              isLoading={false}
              courseContent={courseContent}
            />
          ) : (
            <OverviewTab 
              step={step} 
              selectedSubStep={selectedSubStep} 
              isLoading={false}
              courseContent=""
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
