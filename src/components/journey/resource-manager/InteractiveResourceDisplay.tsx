
import { useState } from "react";
import { Resource } from "@/types/journey";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
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
      
      {/* Resource Card with improved styling */}
      <Card className="border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
        <CardHeader className="p-6 border-b border-slate-600 bg-gradient-to-r from-slate-700 to-slate-800">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-full"></div>
                {selectedResource.title}
              </CardTitle>
              <div className="flex gap-2">
                {resourceLocationLabel && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500">
                    📍 {resourceLocationLabel}
                  </Badge>
                )}
                <Badge variant="outline" className="border-slate-500 text-slate-300">
                  {selectedResource.type || 'Ressource'}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackNavigation}
              disabled={isNavigatingBack}
              className="border-slate-500 hover:border-slate-400 hover:bg-slate-700 text-slate-200 hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {isNavigatingBack ? "Retour..." : "Retour aux ressources"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 bg-slate-800/50">
          {ResourceComponent ? (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 shadow-inner">
              <ResourceComponent
                stepId={stepId}
                substepTitle={effectiveSubstepTitle}
                resourceType={selectedResource.type || 'interactive'}
              />
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-600 rounded-lg bg-slate-700/30">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Composant non disponible</h3>
                  <p className="text-slate-300 mb-4">
                    Le composant "{componentName}" n'est pas encore disponible.
                  </p>
                  <Button
                    variant="outline"
                    onClick={onRetry}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Resource Navigation with improved styling */}
      <ResourceSequenceNavigation
        stepId={stepId}
        currentResource={selectedResource}
        selectedResourceName={selectedResourceName}
        substepTitle={effectiveSubstepTitle}
      />
    </div>
  );
}
