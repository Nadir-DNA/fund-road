
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import StepContent from "./StepContent";
import StepNavigation from "@/components/journey/StepNavigation";
import { Badge } from "@/components/ui/badge";
import { getResourceLocationLabel } from "@/utils/resourceHelpers";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam, resource: resourceName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Récupération des paramètres d'URL
  const selectedResource = searchParams.get('resource') || resourceName;
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;
  
  // Generate a unique key to force component remounts when needed
  const locationKey = `${location.pathname}${location.search}`;
  
  // Determine if we're viewing a resource - force it to be a boolean to avoid ambiguity
  const isViewingResource = Boolean(selectedResource);

  // Get resource location label if a resource is selected
  const resourceLocationLabel = isViewingResource ? 
    getResourceLocationLabel(stepId, selectedResource) : null;
  
  console.log("StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle, 
    resourceName: selectedResource,
    isViewingResource,
    locationKey,
    resourceLocationLabel
  });

  // Clear URL params when changing steps to avoid resource persistence
  useEffect(() => {
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath && lastPath !== location.pathname && selectedResource) {
      console.log("Path changed, clearing resource parameter");
      navigate(location.pathname, { replace: true });
    }
    sessionStorage.setItem('lastPath', location.pathname);
  }, [location.pathname, selectedResource, navigate]);

  if (!step) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto flex-grow flex items-center justify-center">
          <p>Étape non trouvée</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow p-4 md:p-8 pt-20 pb-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/roadmap')}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour au parcours
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{step.title}</h1>
          {selectedSubStep && (
            <div className="mt-2">
              <Badge variant="secondary" className="mr-2">
                Sous-étape {step.subSteps?.indexOf(selectedSubStep) !== -1 ? 
                  `${stepId}.${step.subSteps.indexOf(selectedSubStep) + 1}` : 
                  `${stepId}.?`
                }
              </Badge>
              <span className="font-medium">{selectedSubStep.title}</span>
            </div>
          )}
          
          {isViewingResource && resourceLocationLabel && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-primary/20 text-primary mr-2">
                Ressource {resourceLocationLabel}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {selectedResource}
              </span>
            </div>
          )}
          
          <p className="text-muted-foreground mt-2">
            {selectedSubStep ? selectedSubStep.description : step.description}
          </p>
        </div>
        
        <StepContent 
          key={locationKey}
          step={step} 
          selectedSubStep={selectedSubStep}
          stepId={stepId}
          substepTitle={substepTitle}
          resourceName={selectedResource}
          isLoading={isLoading}
          isViewingResource={isViewingResource} 
        />
        
        {/* Only show step navigation when NOT viewing a resource */}
        {!isViewingResource && (
          <div className="mt-8 border-t border-slate-700 pt-6">
            <StepNavigation stepId={stepId} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
