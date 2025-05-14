
import { Resource } from "@/types/journey";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { getStepResources } from "@/utils/resourceHelpers";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ResourceFiltersProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedSubSubstepTitle?: string | null | undefined;
  materials: any[] | undefined;
  hasSession: boolean | null;
  onResourcesFound: (resources: Resource[]) => void;
}

export function ResourceFilters({
  step,
  selectedSubstepTitle,
  selectedSubSubstepTitle,
  materials,
  hasSession,
  onResourcesFound
}: ResourceFiltersProps) {
  // Use the hook to fetch resources
  const { data: resources, isLoading, error } = useResourceFilters(
    step,
    selectedSubstepTitle,
    selectedSubSubstepTitle,
    materials,
    hasSession,
    onResourcesFound
  );

  // Log current state for debugging
  console.log("ResourceFilters - Params:", {
    stepId: step.id, 
    substep: selectedSubstepTitle || "main", 
    subsubstep: selectedSubSubstepTitle || "none"
  });
  console.log("ResourceFilters - Resources:", resources?.length || 0);
  
  // Add direct Supabase query for course content with improved error handling
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        console.log(`Fetching course content for step: ${step.id}, substep: ${selectedSubstepTitle || 'main'}`);
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', step.id)
          .eq('resource_type', 'course');
        
        // Properly handle null substep_title
        if (selectedSubstepTitle) {
          // Rechercher par le titre exact ou par des variantes connues
          const possibleTitles = getPossibleSubstepTitles(selectedSubstepTitle);
          if (possibleTitles.length > 1) {
            query = query.in('substep_title', possibleTitles);
          } else {
            query = query.eq('substep_title', selectedSubstepTitle);
          }
        } else {
          // Pour l'étape principale, chercher les valeurs NULL de substep_title
          query = query.is('substep_title', null);
        }
        
        const { data: courseData, error: courseError } = await query;
        
        if (courseError) {
          console.error("Error fetching course content:", courseError);
          return;
        }
        
        if (courseData && courseData.length > 0) {
          console.log(`Found ${courseData.length} course content items from Supabase:`, courseData);
          
          // Map course content to resources format and add to existing resources
          const courseResources = courseData.map(item => ({
            id: item.id || `course-${Math.random().toString(36).substring(7)}`,
            title: item.title || "Course Content",
            description: item.description || "Course materials",
            componentName: "CourseContentDisplay",
            type: "course",
            courseContent: item.course_content,
            status: 'available' as const
          }));
          
          // Combine with other resources
          if (resources) {
            onResourcesFound([...resources, ...courseResources]);
          } else {
            onResourcesFound(courseResources);
          }
        } else {
          console.log("No course content found in Supabase");
          
          // En l'absence de contenu, vérifier si nous disposons de ressources de secours dans le code
          const fallbackResources = getFallbackResources(step.id, selectedSubstepTitle);
          if (fallbackResources.length > 0) {
            console.log("Using fallback resources:", fallbackResources.length);
            if (resources) {
              onResourcesFound([...resources, ...fallbackResources]);
            } else {
              onResourcesFound(fallbackResources);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch course content:", error);
        
        // En cas d'erreur, essayer d'utiliser des ressources de secours
        const fallbackResources = getFallbackResources(step.id, selectedSubstepTitle);
        if (fallbackResources.length > 0) {
          console.log("Using fallback resources after error:", fallbackResources.length);
          onResourcesFound(fallbackResources);
        }
      }
    };
    
    // Fonction utilitaire pour obtenir toutes les variantes possibles d'un nom de sous-étape
    function getPossibleSubstepTitles(title: string): string[] {
      const titles = [title];
      
      // Correspondances connues pour l'étape 2 (Conception)
      if (step.id === 2) {
        if (title === 'Proposition de valeur') {
          titles.push('_persona', '_problemSolution', '_empathy');
        } else if (title === 'Stratégie produit') {
          titles.push('_mvp', '_productStrategy', '_roadmap');
        }
      }
      
      return titles;
    }
    
    // Fonction pour générer des ressources de secours basées sur le code
    function getFallbackResources(stepId: number, substepTitle: string | undefined): Resource[] {
      // Ressources de secours pour l'étape 2: Conception
      if (stepId === 2) {
        if (substepTitle === 'Proposition de valeur') {
          return [
            { 
              title: "Canvas Problème / Solution", 
              componentName: "ProblemSolutionCanvas",
              description: "Visualisez l'adéquation entre le problème et votre solution",
              status: 'available' as const
            },
            { 
              title: "Fiche Persona utilisateur", 
              componentName: "PersonaBuilder",
              description: "Créez un profil détaillé de votre utilisateur cible",
              status: 'available' as const 
            },
            { 
              title: "Carte d'empathie", 
              componentName: "EmpathyMap",
              description: "Analysez motivations et freins de votre utilisateur",
              status: 'available' as const 
            }
          ];
        } else if (substepTitle === 'Stratégie produit') {
          return [
            { 
              title: "Sélection de MVP", 
              componentName: "MVPSelector",
              description: "Choisissez la stratégie MVP la plus adaptée",
              status: 'available' as const 
            },
            { 
              title: "Cahier des charges MVP", 
              componentName: "MvpSpecification",
              description: "Spécifiez les contours de votre MVP",
              status: 'available' as const 
            },
            { 
              title: "Matrice impact/effort", 
              componentName: "FeaturePrioritizationMatrix",
              description: "Priorisez vos fonctionnalités pour le MVP",
              status: 'available' as const 
            }
          ];
        }
      }
      
      return [];
    }
    
    // Only fetch if we have a valid step id
    if (step && step.id) {
      fetchCourseContent();
    }
  }, [step.id, selectedSubstepTitle, onResourcesFound, resources]);

  // Le composant ne rend rien directement, il gère uniquement la logique de requête
  return null;
}

// Export the helper function for direct use
export { getStepResources };
