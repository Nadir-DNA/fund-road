
import { useState } from "react";
import { Resource } from "@/types/journey";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getResourceComponentByName } from "../utils/resourceRenderer";
import ResourceSequenceNavigation from "./ResourceSequenceNavigation";
import CourseSection from "./CourseSection";
import { saveResourceReturnPath, getResourceReturnPath, clearResourceReturnPath } from "@/utils/navigationUtils";

interface InteractiveResourceDisplayProps {
  selectedResource: Resource;
  componentName: string;
  resourceLocationLabel: string | null;
  stepId: number;
  selectedSubstepTitle: string;
  selectedResourceName: string;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
  onRetry: () => void;
  subsubstepTitle?: string | null;
}

export default function InteractiveResourceDisplay({
  selectedResource,
  componentName,
  resourceLocationLabel,
  stepId,
  selectedSubstepTitle,
  selectedResourceName,
  allResources,
  currentIndex,
  totalResources,
  onRetry,
  subsubstepTitle
}: InteractiveResourceDisplayProps) {
  const navigate = useNavigate();
  const [isNavigatingBack, setIsNavigatingBack] = useState<boolean>(false);
  
  // Get the component to render
  const ResourceComponent = getResourceComponentByName(componentName);
  
  // Use the substep title from the resource if available, otherwise use the selected substep title
  const effectiveSubstepTitle = subsubstepTitle || selectedSubstepTitle;
  
  // Handle back navigation
  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    
    // Get stored return path or build a default path
    const returnPath = getResourceReturnPath() || `/roadmap/step/${stepId}/${encodeURIComponent(effectiveSubstepTitle)}`;
    
    // Clear stored path
    clearResourceReturnPath();
    
    // Navigate back
    console.log(`Navigating back to: ${returnPath}`);
    setTimeout(() => {
      navigate(returnPath);
      setTimeout(() => setIsNavigatingBack(false), 300);
    }, 100);
  };
  
  return (
    <div className="space-y-6">
      {/* Course Section - Integrated above the resource */}
      <CourseSection 
        stepId={stepId}
        substepTitle={effectiveSubstepTitle}
        resourceTitle={selectedResource.title}
      />
      
      {/* Resource Card */}
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">{selectedResource.title}</CardTitle>
              {resourceLocationLabel && (
                <Badge variant="outline" className="mt-1 bg-primary/10 text-primary">
                  {resourceLocationLabel}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              disabled={isNavigatingBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux ressources
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {ResourceComponent ? (
            <ResourceComponent
              stepId={stepId}
              substepTitle={effectiveSubstepTitle}
              resourceType={selectedResource.type || 'interactive'}
            />
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-700 rounded-lg">
              <p className="text-muted-foreground">
                Le composant "{componentName}" n'est pas disponible.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resource Navigation */}
      <ResourceSequenceNavigation
        stepId={stepId}
        currentResource={selectedResource}
        selectedResourceName={selectedResourceName}
        substepTitle={effectiveSubstepTitle}
      />
    </div>
  );
}
