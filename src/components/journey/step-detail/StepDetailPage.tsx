
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import StepContent from "./StepContent";
import StepNavigation from "@/components/journey/StepNavigation";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam, resource: resourceName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Récupération des paramètres d'URL
  const selectedResource = searchParams.get('resource');
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;
  
  // Determine if we're viewing a resource - force it to be a boolean to avoid ambiguity
  const isViewingResource = Boolean(selectedResource || resourceName);
  
  console.log("StepDetailPage - Loading with:", { 
    stepId, 
    substepTitle, 
    resourceName: resourceName || selectedResource,
    isViewingResource // Log this value to confirm it's working
  });

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
          <p className="text-muted-foreground mt-2">
            {selectedSubStep ? selectedSubStep.description : step.description}
          </p>
        </div>
        
        <StepContent 
          step={step} 
          selectedSubStep={selectedSubStep}
          stepId={stepId}
          substepTitle={substepTitle}
          resourceName={resourceName || selectedResource}
          isLoading={isLoading}
          isViewingResource={isViewingResource} // Pass this prop explicitly
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
