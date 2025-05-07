
import { useState, useEffect, useCallback, useRef } from "react";
import ResourcesList from "@/components/journey/ResourcesList";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { renderResourceComponent } from "../utils/resourceRenderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";

interface ResourcesTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
}

export default function ResourcesTab({ stepId, substepTitle, stepTitle }: ResourcesTabProps) {
  const [manualResources, setManualResources] = useState<any[]>([]);
  const [manualLoading, setManualLoading] = useState<boolean>(true);
  const [selectedResourceName, setSelectedResourceName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const initialLoadDoneRef = useRef(false);
  const currentStepIdRef = useRef<number>(stepId);
  const location = useLocation();

  // Force reset when component mounts with new stepId or when component's key changes
  useEffect(() => {
    console.log(`ResourcesTab mounted/refreshed with stepId ${stepId}`);
    initialLoadDoneRef.current = false;
    setSelectedResourceName(null);
    currentStepIdRef.current = stepId;
    
    // Return cleanup function
    return () => {
      console.log(`ResourcesTab for stepId ${stepId} unmounting`);
    };
  }, [refreshKey]); // Only run on mount or when refreshKey changes

  // Reset state when step ID changes
  useEffect(() => {
    if (currentStepIdRef.current !== stepId) {
      console.log(`ResourcesTab: Step changed from ${currentStepIdRef.current} to ${stepId}, resetting state`);
      currentStepIdRef.current = stepId;
      initialLoadDoneRef.current = false;
      setSelectedResourceName(null);
      setManualResources([]);
      setRefreshKey(prev => prev + 1);
    }
  }, [stepId]);

  // Reset when navigation includes resetResource state
  useEffect(() => {
    if (location.state && (location.state as any).resetResource) {
      console.log("ResourcesTab: Detected resetResource state, resetting component state");
      initialLoadDoneRef.current = false;
      setSelectedResourceName(null);
      setManualResources([]);
      setRefreshKey(prev => prev + 1);
      
      // Clear the state to prevent repeated resets by creating a new history entry
      // that preserves other state properties but removes resetResource
      window.history.replaceState(
        { ...location.state, resetResource: false },
        document.title
      );
    }
  }, [location.state]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
        console.log("ResourcesTab: Auth check completed, user is", data.session ? "authenticated" : "not authenticated");
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch resources for this specific step and substep
  const fetchResourcesManually = useCallback(async () => {
    // Skip if we already loaded resources for this step and nothing has changed
    if (initialLoadDoneRef.current && currentStepIdRef.current === stepId) {
      console.log(`ResourcesTab: Resources already loaded for step ${stepId}, skipping fetch`);
      return;
    }
    
    setManualLoading(true);
    setLoadError(null);
    console.log("🔍 Fetching resources for:", { stepId, substepTitle });
    
    try {
      let query = supabase
        .from("entrepreneur_resources")
        .select("*")
        .eq("step_id", stepId);
        
      if (substepTitle) {
        query = query.eq("substep_title", substepTitle);
        console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title="${substepTitle}"`);
      } else {
        query = query.is("substep_title", null);
        console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title IS NULL`);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        console.error("❌ Error fetching resources:", error);
        setLoadError(error.message);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les ressources",
          variant: "destructive"
        });
      } else {
        console.log("✅ Resources found:", data?.length || 0);
        
        // If no resources returned for key section, add hardcoded ones
        if (stepId === 1 && substepTitle === "Définition de l'opportunité" && (!data || data.length === 0)) {
          console.log("Adding default resources for opportunity definition");
          const defaultResources = [
            {
              id: 'opportunity-definition',
              title: 'Synthèse qualitative',
              description: 'Définissez votre opportunité entrepreneuriale',
              component_name: 'OpportunityDefinition',
              resource_type: 'interactive'
            },
            {
              id: 'market-size-estimator',
              title: 'Estimation de marché TAM/SAM/SOM',
              description: 'Calculez la taille de votre marché adressable',
              component_name: 'MarketSizeEstimator',
              resource_type: 'interactive'
            },
            {
              id: 'competitive-analysis-table',
              title: 'Analyse concurrentielle',
              description: 'Analysez vos concurrents pour identifier votre différenciation',
              component_name: 'CompetitiveAnalysisTable',
              resource_type: 'interactive'
            }
          ];
          setManualResources(defaultResources);
        } else {
          setManualResources(data || []);
        }
        
        if (!data || data.length === 0) {
          console.log("No resources found for this step/substep in database");
        }
        
        // Mark as loaded for this step
        initialLoadDoneRef.current = true;
      }
    } catch (err) {
      console.error("❌ Exception:", err);
      setLoadError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setManualLoading(false);
    }
  }, [stepId, substepTitle]);

  useEffect(() => {
    if (stepId) {
      fetchResourcesManually();
    }
  }, [stepId, substepTitle, fetchResourcesManually, refreshKey]);

  const handleResourceSelect = (resourceName: string) => {
    setSelectedResourceName(resourceName);
    console.log(`Selected resource: ${resourceName}`);
  };

  const handleBackToList = () => {
    setSelectedResourceName(null);
  };

  const handleRetry = () => {
    console.log("Retrying resource load...");
    initialLoadDoneRef.current = false;
    setRefreshKey(prev => prev + 1);
  };

  // Display selected resource or resource list
  if (selectedResourceName) {
    return (
      <div>
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center"
          onClick={handleBackToList}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux ressources
        </Button>
        
        <Card>
          <CardContent className="p-6">
            {renderResourceComponent(
              selectedResourceName,
              stepId,
              substepTitle || '',
              null
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <ResourcesList 
        stepId={stepId} 
        substepTitle={substepTitle}
        stepTitle={stepTitle}
        onResourceSelect={handleResourceSelect}
      />
      
      {/* Loading state */}
      {manualLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingIndicator size="md" />
          <span className="ml-2 text-muted-foreground">Chargement des ressources...</span>
        </div>
      )}
      
      {/* Error state */}
      {loadError && (
        <div className="mt-4 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <p className="text-destructive font-medium">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
          <Button 
            variant="outline"
            className="mt-2"
            onClick={handleRetry}
          >
            Réessayer
          </Button>
        </div>
      )}
      
      {/* Resources display from manual fetch */}
      {!manualLoading && manualResources.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h3 className="font-medium mb-4">Ressources directement disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manualResources.map((resource, idx) => (
              <Card key={idx} 
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => resource.component_name && handleResourceSelect(resource.component_name)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{resource.title || 'Sans titre'}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{resource.description || 'Pas de description'}</p>
                  <div className="mt-2 flex gap-2">
                    {resource.resource_type && (
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {resource.resource_type}
                      </span>
                    )}
                    {resource.component_name && (
                      <span className="px-2 py-1 bg-slate-800 text-primary rounded text-xs">
                        {resource.component_name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state with retry option */}
      {!manualLoading && manualResources.length === 0 && !loadError && (
        <div className="mt-6 p-6 border rounded-lg text-center">
          <p className="text-muted-foreground">
            Aucune ressource trouvée pour cette étape.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            (Étape: {stepId}, {substepTitle ? `Sous-étape: ${substepTitle}` : "Étape principale"})
          </p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={handleRetry}
          >
            Réessayer le chargement
          </Button>
        </div>
      )}
      
      {/* Authentication warning */}
      {isAuthenticated === false && (
        <div className="mt-6 p-4 border border-amber-500/20 rounded-lg bg-amber-500/10">
          <p className="text-amber-400">
            Connectez-vous pour accéder à toutes les ressources et enregistrer vos données.
          </p>
          <a href="/auth" className="text-primary underline text-sm mt-2 block">
            Se connecter
          </a>
        </div>
      )}
    </div>
  );
}
