
import { useState, useEffect } from "react";
import { useResourceFetch } from "@/hooks/resource/useResourceFetch";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, BookOpen, Wrench, ExternalLink } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";
import { journeySteps } from "@/data/journeySteps";
import { supabase } from "@/integrations/supabase/client";

interface ResourcesBySubstepProps {
  stepId: number;
  activeSubstepTitle: string | null;
}

// Helper function to safely access resource properties
const getResourceSubstepTitle = (resource: any): string => {
  return resource.subsubstepTitle || resource.substepTitle || 'main';
};

// Helper function to get the target substep for navigation
const getNavigationSubstepTitle = (resource: any, activeSubstepTitle: string | null): string => {
  if (resource.subsubstepTitle) {
    return resource.subsubstepTitle;
  }
  if (resource.substepTitle) {
    return resource.substepTitle;
  }
  return activeSubstepTitle || 'main';
};

// Helper function to ensure resource has required properties
const normalizeResource = (resource: any) => {
  return {
    ...resource,
    id: resource.id || `resource-${Math.random().toString(36).substring(7)}`,
    type: resource.type || resource.resource_type || 'resource',
    componentName: resource.componentName || resource.component_name,
    status: resource.status || 'available'
  };
};

export default function ResourcesBySubstep({
  stepId,
  activeSubstepTitle
}: ResourcesBySubstepProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const selectedResourceName = searchParams.get('resource');
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    checkAuth();
  }, []);

  // Get the step data
  const step = journeySteps.find(s => s.id === stepId);
  
  // Use the resource fetch hook
  const { data: resources = [], isLoading } = useResourceFetch(
    step || { id: stepId, title: "", description: "", resources: [] },
    undefined,
    null,
    hasSession
  );

  // Group resources by substep with safe property access
  const resourcesBySubstep = resources.reduce((acc, resource) => {
    const normalizedResource = normalizeResource(resource);
    const substepKey = getResourceSubstepTitle(normalizedResource);
    if (!acc[substepKey]) {
      acc[substepKey] = [];
    }
    acc[substepKey].push(normalizedResource);
    return acc;
  }, {} as Record<string, any[]>);

  // Auto-open the active substep section
  useEffect(() => {
    if (activeSubstepTitle) {
      setOpenSections(prev => new Set([...prev, activeSubstepTitle]));
    } else {
      setOpenSections(prev => new Set([...prev, 'main']));
    }
  }, [activeSubstepTitle]);

  const handleResourceClick = (resource: any) => {
    const normalizedResource = normalizeResource(resource);
    
    console.log("ResourcesBySubstep: Resource clicked", { 
      resource: normalizedResource.title,
      componentName: normalizedResource.componentName 
    });
    
    // Save current path for potential return
    saveResourceReturnPath(window.location.pathname);
    
    // Get the correct substep title for navigation
    const targetSubstepTitle = getNavigationSubstepTitle(normalizedResource, activeSubstepTitle);
    
    // Build the resource URL
    const resourceUrl = buildResourceUrl(
      stepId, 
      targetSubstepTitle, 
      normalizedResource.componentName
    );
    
    navigate(resourceUrl);
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const getResourceIcon = (resource: any) => {
    const resourceType = resource.resource_type || resource.type;
    switch(resourceType) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'interactive':
        return <Wrench className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSubstepDisplayName = (substepKey: string) => {
    if (substepKey === 'main') return '📋 Ressources principales';
    if (step?.subSteps) {
      const substep = step.subSteps.find(s => s.title === substepKey);
      if (substep) {
        const index = step.subSteps.indexOf(substep);
        return `${stepId}.${index + 1} ${substep.title}`;
      }
    }
    return substepKey;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Navigation par sections</h3>
        <p className="text-sm text-slate-400">
          Explorez les ressources organisées par sous-étapes
        </p>
      </div>

      {Object.entries(resourcesBySubstep).map(([substepKey, substepResources]) => (
        <Card key={substepKey} className="border-slate-600 bg-slate-800/50">
          <Collapsible 
            open={openSections.has(substepKey)} 
            onOpenChange={() => toggleSection(substepKey)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-slate-700/50 transition-colors p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {openSections.has(substepKey) ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                    <CardTitle className="text-base font-medium text-white">
                      {getSubstepDisplayName(substepKey)}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {substepResources.length}
                    </Badge>
                  </div>
                  {substepKey === activeSubstepTitle && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      Actuel
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 px-4">
                <div className="space-y-2">
                  {substepResources.map((resource, index) => (
                    <Button
                      key={`${resource.id || resource.componentName}-${index}`}
                      variant={selectedResourceName === resource.componentName ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 text-left transition-all duration-200 ${
                        selectedResourceName === resource.componentName
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                          : "hover:bg-slate-700 text-slate-200 hover:text-white"
                      }`}
                      onClick={() => handleResourceClick(resource)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-0.5">
                          {getResourceIcon(resource)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {resource.title}
                          </div>
                          {resource.description && (
                            <div className="text-xs opacity-75 mt-1 line-clamp-2">
                              {resource.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs border-current opacity-75"
                            >
                              {resource.resource_type || resource.type || 'resource'}
                            </Badge>
                            {resource.file_url && (
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
      
      {Object.keys(resourcesBySubstep).length === 0 && (
        <Card className="border-slate-600 bg-slate-800/30">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <FileText className="h-12 w-12 mx-auto text-slate-500" />
              <h3 className="text-lg font-medium text-slate-300">Aucune ressource trouvée</h3>
              <p className="text-sm text-slate-500">
                Les ressources pour cette étape seront disponibles prochainement.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
