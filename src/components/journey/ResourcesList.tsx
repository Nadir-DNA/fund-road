
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import ResourceCard from "./resource-manager/ResourceCard";

interface ResourcesListProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
  onResourceSelect?: (componentName: string) => void;
}

export default function ResourcesList({ 
  stepId, 
  substepTitle, 
  stepTitle,
  onResourceSelect
}: ResourcesListProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    
    checkAuth();
  }, []);

  // Fetch resources from Supabase
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log(`ResourcesList: Loading resources for step ${stepId}, substep: ${substepTitle || 'main'}`);
      
      try {
        // Build query
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId);
          
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) {
          console.error("Error fetching resources:", fetchError);
          setError("Impossible de charger les ressources");
          toast({
            title: "Erreur de chargement",
            description: "Impossible de charger les ressources",
            variant: "destructive"
          });
        } else {
          console.log(`Found ${data?.length || 0} resources:`, data);
          setResources(data || []);
        }
      } catch (err) {
        console.error("Exception fetching resources:", err);
        setError("Une erreur est survenue lors du chargement des ressources");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [stepId, substepTitle, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingIndicator size="md" />
        <span className="ml-2 text-muted-foreground">Chargement des ressources...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
        <p className="text-destructive font-medium">Erreur</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }
  
  if (resources.length === 0) {
    return (
      <div className="text-center py-6 border-t">
        <p className="text-muted-foreground">
          Aucune ressource disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Ressources disponibles ({resources.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <ResourceCard 
            key={`resource-${resource.id}`}
            resource={resource}
            stepId={stepId}
            substepTitle={substepTitle || ''}
            onClick={() => {
              if (resource.component_name && onResourceSelect) {
                onResourceSelect(resource.component_name);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
