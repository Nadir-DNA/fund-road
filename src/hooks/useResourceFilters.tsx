
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import { toast } from "@/components/ui/use-toast";
import { getStepResources } from "@/utils/resourceHelpers";

export const useResourceFilters = (
  step: any,
  selectedSubstepTitle: string | undefined,
  selectedSubSubstepTitle: string | null | undefined,
  materials: any[] | undefined,
  hasSession: boolean | null,
  onResourcesFound: (resources: Resource[]) => void
) => {
  // Query to fetch resources
  return useQuery({
    queryKey: ['resources', step.id, selectedSubstepTitle, selectedSubSubstepTitle, materials?.length],
    queryFn: async () => {
      console.log(`Loading resources for step ID: ${step.id}, substep: ${selectedSubstepTitle || 'main step'}, subsubstep: ${selectedSubSubstepTitle || 'none'}`);

      // Map material names to component names for correct linking
      const mapMaterialToComponentName = (resourceType: string) => {
        // This mapping converts the database resource_type to the proper component name
        const mappings: Record<string, string> = {
          'user_research_notebook': 'UserResearchNotebook',
          'customer_behavior_notes': 'CustomerBehaviorNotes',
          'persona_builder': 'PersonaBuilder',
          'empathy_map': 'EmpathyMap',
          'opportunity_definition': 'OpportunityDefinition',
          'swot_analysis': 'SwotAnalysis',
          'business_model_canvas': 'BusinessModelCanvas',
          'problem_solution_canvas': 'ProblemSolutionCanvas',
          'problem_solution_matrix': 'ProblemSolutionMatrix',
          'competitive_analysis_table': 'CompetitiveAnalysisTable',
          'market_analysis_grid': 'MarketAnalysisGrid',
          'market_size_estimator': 'MarketSizeEstimator',
          'mvp_selector': 'MVPSelector',
          'mvp_specification': 'MvpSpecification',
          'feature_prioritization_matrix': 'FeaturePrioritizationMatrix',
          'product_roadmap_editor': 'ProductRoadmapEditor',
          'user_feedback_form': 'UserFeedbackForm',
          'experiment_summary': 'ExperimentSummary',
          'business_plan_intent': 'BusinessPlanIntent',
          'business_plan_editor': 'BusinessPlanEditor',
          'financial_tables': 'FinancialTables',
          'monetization_test_grid': 'MonetizationTestGrid',
          'growth_projection': 'GrowthProjection',
          'dilution_simulator': 'DilutionSimulator',
          'legal_status_selector': 'LegalStatusSelector',
          'legal_status_comparison': 'LegalStatusComparison',
          'cofounder_profile': 'CofounderProfile',
          'cofounder_alignment': 'CofounderAlignment',
          'recruitment_plan': 'RecruitmentPlan',
          'cap_table_editor': 'CapTableEditor',
          'ip_self_assessment': 'IPSelfAssessment',
          'ip_procedures_checklist': 'IPProceduresChecklist',
          'funding_map': 'FundingMap',
          'term_sheet_builder': 'TermSheetBuilder',
          'pitch_storyteller': 'PitchStoryTeller',
          'investor_email_script': 'InvestorEmailScript',
          'investor_objection_prep': 'InvestorObjectionPrep',
          'investor_followup_plan': 'InvestorFollowUpPlan',
          'startup_tool_picker': 'StartupToolPicker'
        };
        
        return mappings[resourceType] || resourceType;
      };

      if (materials && materials.length > 0) {
        console.log("Using materials from useCourseMaterials for resources");

        const filteredResources = materials.filter(item =>
          (item.resource_type === 'resource' ||
            item.resource_type === 'tool' ||
            item.resource_type === 'template') &&
          (
            (selectedSubSubstepTitle
              ? item.subsubstep_title === selectedSubSubstepTitle
              : selectedSubstepTitle
              ? item.substep_title === selectedSubstepTitle && (item.subsubstep_title === null || item.subsubstep_title === undefined || item.subsubstep_title === '')
              : item.substep_title === null)
          )
        ).map(item => ({
          id: item.id || `material-${Math.random().toString(36).substring(7)}`,
          title: item.title,
          description: item.description || '',
          componentName: mapMaterialToComponentName(item.resource_type) || item.component_name || '',
          url: item.file_url,
          type: item.resource_type || 'resource',
          status: 'available' as const
        }));

        console.log(`Found ${filteredResources.length} resources from materials`, filteredResources);

        if (filteredResources.length > 0) {
          onResourcesFound(filteredResources);
          return filteredResources;
        }
      }

      try {
        // Check if we already determined there's no session
        if (hasSession === false) {
          console.log("No authenticated session found when fetching resources (cached)");
          const stepResources = getStepResources(step, selectedSubstepTitle);
          console.log("Using step resources:", stepResources);
          
          // Map component names from resource types
          const mappedResources = stepResources.map(resource => ({
            ...resource,
            componentName: resource.componentName || mapMaterialToComponentName(resource.type || '')
          }));
          
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
          console.log("No authenticated session found when fetching resources");
          const stepResources = getStepResources(step, selectedSubstepTitle);
          console.log("Using step resources:", stepResources);
          
          // Map component names from resource types
          const mappedResources = stepResources.map(resource => ({
            ...resource,
            componentName: resource.componentName || mapMaterialToComponentName(resource.type || '')
          }));
          
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        console.log("Building Supabase query for resources");
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id);

        if (selectedSubstepTitle) {
          query = query.eq('substep_title', selectedSubstepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        if (selectedSubSubstepTitle) {
          query = query.eq('subsubstep_title', selectedSubSubstepTitle);
        } else {
          query = query.or('subsubstep_title.is.null,subsubstep_title.eq.'); // Include null or empty string subsubstep
        }

        query = query.neq('resource_type', 'course');

        console.log("Executing Supabase query for resources");
        const { data, error } = await query;

        if (error) {
          console.error("Error fetching resources:", error);
          toast({
            title: "Erreur de chargement",
            description: "Impossible de récupérer les ressources",
            variant: "destructive"
          });
          const stepResources = getStepResources(step, selectedSubstepTitle);
          
          // Map component names from resource types
          const mappedResources = stepResources.map(resource => ({
            ...resource,
            componentName: resource.componentName || mapMaterialToComponentName(resource.type || '')
          }));
          
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        console.log(`Retrieved ${data?.length || 0} resources from Supabase for step ${step.id}`, data);

        if (data && data.length > 0) {
          const mappedResources = data.map(item => ({
            id: item.id || `db-${Math.random().toString(36).substring(7)}`,
            title: item.title,
            description: item.description || '',
            componentName: mapMaterialToComponentName(item.resource_type) || item.component_name,
            url: item.file_url,
            type: item.resource_type || 'resource',
            status: 'available' as const
          }));
          console.log("Mapped resources:", mappedResources);
          onResourcesFound(mappedResources);
          return mappedResources;
        }

        const stepResources = getStepResources(step, selectedSubstepTitle);
        console.log("No resources from DB, using step resources:", stepResources);
        
        // Map component names from resource types
        const mappedResources = stepResources.map(resource => ({
          ...resource,
          componentName: resource.componentName || mapMaterialToComponentName(resource.type || '')
        }));
        
        onResourcesFound(mappedResources);
        return mappedResources;

      } catch (err) {
        console.error("Error in resource query:", err);
        toast({
          title: "Erreur de chargement",
          description: "Problème lors de la récupération des ressources",
          variant: "destructive"
        });
        const stepResources = getStepResources(step, selectedSubstepTitle);
        
        // Map component names from resource types
        const mappedResources = stepResources.map(resource => ({
          ...resource,
          componentName: resource.componentName || mapMaterialToComponentName(resource.type || '')
        }));
        
        onResourcesFound(mappedResources);
        return mappedResources;
      }
    },
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
    enabled: hasSession !== null && materials !== undefined,
    retry: 1
  });
};
