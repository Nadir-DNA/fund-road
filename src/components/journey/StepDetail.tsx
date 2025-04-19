
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
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Fetch course content
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title],
    queryFn: async () => {
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session.session) {
          return "";
        }
        
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('course_content, substep_title')
          .eq('step_id', step.id);
        
        if (error) throw error;
        
        let content = "";
        if (data && data.length > 0) {
          if (selectedSubStep) {
            const substepContent = data.find(item => item.substep_title === selectedSubStep.title);
            content = substepContent?.course_content || "";
          } else {
            const stepContent = data.find(item => !item.substep_title || item.substep_title === step.title);
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
    staleTime: 1000 * 60 * 5,
    retry: 1
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
