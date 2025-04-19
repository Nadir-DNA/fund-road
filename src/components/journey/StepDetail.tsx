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
import { useCourseMaterials } from "@/hooks/useCourseMaterials";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [searchParams] = useSearchParams();
  const selectedResourceName = searchParams.get('resource');
  const navigate = useNavigate();
  const { activeTab, handleTabChange } = useStepTabs(selectedResourceName);
  
  // Utiliser le hook useCourseMaterials pour récupérer les matériaux de cours
  const { materials, isLoading: isLoadingMaterials } = useCourseMaterials(
    step.id, 
    selectedSubStep?.title || null
  );

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

  // Fetch course content with improved error handling 
  const { data: courseContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['courseContent', step.id, selectedSubStep?.title, materials],
    queryFn: async () => {
      console.log("Executing courseContent query function");
      // Si nous avons déjà récupéré les matériaux de cours, les utiliser
      if (materials && materials.length > 0) {
        console.log("Using materials from useCourseMaterials:", materials);
        
        let content = "";
        
        if (selectedSubStep) {
          // Pour un sous-step spécifique
          const courseMaterial = materials.find(item => 
            item.substep_title === selectedSubStep.title && 
            item.resource_type === 'course'
          );
          
          if (courseMaterial?.course_content) {
            console.log(`Found course content for substep "${selectedSubStep.title}"`);
            content = courseMaterial.course_content;
          } else {
            console.log(`No specific course content found for substep: "${selectedSubStep.title}"`);
          }
        } else {
          // Pour l'étape principale
          const courseMaterial = materials.find(item => 
            (!item.substep_title || item.substep_title === null) && 
            item.resource_type === 'course'
          );
          
          if (courseMaterial?.course_content) {
            console.log(`Found course content for main step "${step.title}"`);
            content = courseMaterial.course_content;
          } else {
            console.log(`No specific course content found for main step: "${step.title}"`);
          }
        }
        
        return content;
      }
      
      // Fallback - Requête directe à Supabase si nécessaire
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session) {
          console.log("No authenticated session found");
          return "";
        }
        
        console.log(`Fallback: Fetching course content for step ID: ${step.id}, substep: ${selectedSubStep?.title || 'main step'}`);
        
        // Construire la requête
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id)
          .eq('resource_type', 'course');
        
        // Ajouter filtre pour substep si nécessaire
        if (selectedSubStep) {
          query = query.eq('substep_title', selectedSubStep.title);
        } else {
          query = query.is('substep_title', null);
        }
          
        const { data, error } = await query.maybeSingle();
        
        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log("Retrieved course content:", data);
        
        if (data?.course_content) {
          return data.course_content;
        }
        
        return "";
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
    retry: 3,
    enabled: !isLoadingMaterials // Attendre que les matériaux soient chargés
  });

  const handleDialogClose = () => {
    navigate('/roadmap', { replace: true });
  };

  const isLoading = isLoadingMaterials || isLoadingContent;

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
          {isLoading ? (
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
