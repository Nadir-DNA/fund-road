
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResourceFetch } from "@/hooks/resource/useResourceFetch";
import { useToast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { Resource } from "@/types/journey";
import ResourcesBySubstep from "../resource-manager/ResourcesBySubstep";
import ResourceManagerTabs from "../resource-manager/ResourceManagerTabs";
import ResourceManagerContent from "../resource-manager/ResourceManagerContent";

interface ResourcesTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
}

export default function ResourcesTab({
  stepId,
  substepTitle,
  stepTitle
}: ResourcesTabProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [activeTabView, setActiveTabView] = useState("structured");
  const [resources, setResources] = useState<Resource[]>([]);
  
  const selectedResourceName = searchParams.get('resource');

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    
    checkAuth();
  }, []);

  // Dummy step object for useResourceFetch
  const step = {
    id: stepId,
    title: stepTitle,
    description: "",
    resources: []
  };

  // Fetch resources with the hook
  const resourceQuery = useResourceFetch(
    step,
    substepTitle || undefined,
    null,
    hasSession
  );

  // Update resources when query data changes
  useEffect(() => {
    if (resourceQuery.data) {
      setResources(resourceQuery.data);
    }
  }, [resourceQuery.data]);

  // Find the selected resource
  const selectedResource = resources.find(
    r => r.componentName === selectedResourceName
  );

  // Separate available and coming soon resources
  const availableResources = resources.filter(r => r.status !== 'coming-soon');
  const comingSoonResources = resources.filter(r => r.status === 'coming-soon');

  // Loading state
  if (resourceQuery.isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs value={activeTabView} onValueChange={setActiveTabView} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="structured">Par sous-étapes</TabsTrigger>
          <TabsTrigger value="all">Toutes les ressources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="structured">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <ResourcesBySubstep 
                    stepId={stepId}
                    activeSubstepTitle={substepTitle}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {selectedResourceName ? (
                <ResourceManagerContent
                  selectedResource={selectedResource}
                  stepId={stepId}
                  selectedSubstepTitle={substepTitle || ''}
                  selectedResourceName={selectedResourceName}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Sélectionnez une ressource à gauche pour l'afficher ici
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <ResourceManagerTabs
                    availableResources={availableResources}
                    comingSoonResources={comingSoonResources}
                    stepId={stepId}
                    substepTitle={substepTitle || ''}
                    selectedResourceName={selectedResourceName}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              {selectedResourceName ? (
                <ResourceManagerContent
                  selectedResource={selectedResource}
                  stepId={stepId}
                  selectedSubstepTitle={substepTitle || ''}
                  selectedResourceName={selectedResourceName}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Sélectionnez une ressource à gauche pour l'afficher ici
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
