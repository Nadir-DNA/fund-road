
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, Book, BookOpen } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Resource, SubStep, SubSubStep } from "@/types/journey";
import { journeySteps } from "@/data/journeySteps";
import { buildResourceUrl } from "@/utils/navigationUtils";

interface ResourcesBySubstepProps {
  stepId: number;
  activeSubstepTitle?: string | null;
}

export default function ResourcesBySubstep({ stepId, activeSubstepTitle }: ResourcesBySubstepProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loadingResource, setLoadingResource] = useState<string | null>(null);
  const [expandedSubsteps, setExpandedSubsteps] = useState<string[]>([]);
  
  // Find the current step from journey data
  const currentStep = journeySteps.find(s => s.id === stepId);
  const substeps = currentStep?.subSteps || [];
  
  // Get currently selected resource from URL
  const selectedResource = searchParams.get('resource');

  // Auto-expand the currently active substep
  useEffect(() => {
    if (activeSubstepTitle && !expandedSubsteps.includes(activeSubstepTitle)) {
      setExpandedSubsteps(prev => [...prev, activeSubstepTitle]);
    }
  }, [activeSubstepTitle]);

  // Handle opening a resource
  const handleResourceClick = (substepTitle: string, resourceComponent: string) => {
    if (loadingResource) return; // Prevent multiple clicks
    
    setLoadingResource(resourceComponent);
    
    try {
      const url = buildResourceUrl(stepId, substepTitle, resourceComponent);
      
      // Add a small delay to ensure UI updates before navigation
      setTimeout(() => {
        navigate(url);
        
        // Reset loading state after navigation
        setTimeout(() => {
          setLoadingResource(null);
        }, 300);
      }, 100);
    } catch (error) {
      console.error("Error navigating to resource:", error);
      toast({
        title: "Erreur de navigation",
        description: "Impossible d'accéder à cette ressource pour le moment.",
        variant: "destructive",
      });
      setLoadingResource(null);
    }
  };

  // Calculate indices for substeps and resources
  const getResourceNumberLabel = (substepIndex: number, resourceIndex: number) => {
    return `${stepId}.${substepIndex + 1}.${resourceIndex + 1}`;
  };

  if (!currentStep) {
    return <div className="text-center p-4 text-muted-foreground">Étape non trouvée</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Ressources par sous-étape</h3>
      
      <Accordion 
        type="multiple" 
        value={expandedSubsteps} 
        onValueChange={setExpandedSubsteps}
        className="space-y-2"
      >
        {substeps.map((substep, substepIndex) => (
          <AccordionItem 
            key={`substep-${substepIndex}`} 
            value={substep.title}
            className="border border-slate-700 rounded-lg bg-slate-800/50 overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50">
              <div className="flex items-center">
                <span className="font-medium">{stepId}.{substepIndex + 1} {substep.title}</span>
                {substep.resources && substep.resources.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {substep.resources.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="text-sm text-muted-foreground mb-4">
                {substep.description}
              </div>
              
              {substep.resources && substep.resources.length > 0 ? (
                <div className="space-y-3">
                  {substep.resources
                    .filter(resource => resource.componentName && resource.status !== 'coming-soon')
                    .map((resource, resourceIdx) => (
                      <Card 
                        key={`resource-${resourceIdx}`} 
                        className={`p-3 flex items-center justify-between border-slate-600 
                          ${selectedResource === resource.componentName ? 'border-primary ring-1 ring-primary' : 'hover:border-slate-500'}`}
                      >
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className="mr-2 px-1.5 py-0 text-xs font-mono" 
                          >
                            {getResourceNumberLabel(substepIndex, resourceIdx)}
                          </Badge>
                          <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{resource.title}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={selectedResource === resource.componentName ? "default" : "ghost"}
                          className="h-7 px-2 ml-2 text-xs"
                          onClick={() => handleResourceClick(substep.title, resource.componentName || '')}
                          disabled={loadingResource === resource.componentName}
                        >
                          {loadingResource === resource.componentName ? (
                            <LoadingIndicator size="sm" className="mr-1" />
                          ) : selectedResource === resource.componentName ? (
                            'Ouvert'
                          ) : (
                            <>
                              Ouvrir
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="py-3 px-4 text-center text-muted-foreground text-sm border border-dashed border-slate-600 rounded-md">
                  Aucune ressource disponible pour cette sous-étape
                </div>
              )}
              
              {substep.subSubSteps && substep.subSubSteps.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Sous-sections</h4>
                  <div className="space-y-3 pl-2 border-l border-slate-700">
                    {substep.subSubSteps.map((subsubstep, ssIdx) => (
                      <div key={`subsubstep-${ssIdx}`} className="pt-2">
                        <div className="text-sm font-medium mb-1">
                          {stepId}.{substepIndex + 1}.{ssIdx + 1} {subsubstep.title}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{subsubstep.description}</div>
                        
                        {subsubstep.resources && subsubstep.resources.length > 0 ? (
                          <div className="space-y-2 pl-2">
                            {subsubstep.resources
                              .filter(resource => resource.componentName && resource.status !== 'coming-soon')
                              .map((resource, rIdx) => (
                                <Card 
                                  key={`subres-${rIdx}`} 
                                  className={`p-2 flex items-center justify-between border-slate-600
                                    ${selectedResource === resource.componentName ? 'border-primary ring-1 ring-primary' : 'hover:border-slate-500'}`}
                                >
                                  <div className="flex items-center">
                                    <Badge 
                                      variant="outline" 
                                      className="mr-2 px-1.5 py-0 text-xs font-mono"
                                    >
                                      {`${stepId}.${substepIndex + 1}.${ssIdx + 1}.${rIdx + 1}`}
                                    </Badge>
                                    <Book className="h-3 w-3 mr-2 text-muted-foreground" />
                                    <span className="text-xs">{resource.title}</span>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant={selectedResource === resource.componentName ? "default" : "ghost"}
                                    className="h-6 px-2 ml-2 text-xs"
                                    onClick={() => handleResourceClick(substep.title, resource.componentName || '')}
                                    disabled={loadingResource === resource.componentName}
                                  >
                                    {loadingResource === resource.componentName ? (
                                      <LoadingIndicator size="sm" className="mr-1" />
                                    ) : selectedResource === resource.componentName ? (
                                      'Ouvert'
                                    ) : (
                                      <>
                                        Ouvrir
                                        <ChevronRight className="h-3 w-3 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                </Card>
                              ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {substeps.length === 0 && (
        <div className="py-6 text-center text-muted-foreground border border-dashed rounded-lg">
          Aucune sous-étape disponible pour cette étape
        </div>
      )}
    </div>
  );
}
