
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Step, SubStep } from "@/types/journey";
import { journeySteps } from "@/data/journeySteps";
import { isBrowser } from "@/utils/navigationUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import StepContent from "./StepContent";
import StepNavigation from "./StepNavigation";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam, resource: resourceName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const selectedResource = searchParams.get('resource');
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;
  
  console.log("StepDetail - stepId:", stepId, "substepTitle:", substepTitle, "resourceName:", resourceName || selectedResource);
  console.log("step found:", step?.title);
  console.log("selectedSubStep found:", selectedSubStep?.title);

  // If resource is provided, ensure we show the resources tab
  useEffect(() => {
    if (resourceName || selectedResource) {
      console.log("Resource provided, showing resources tab");
    }
  }, [resourceName, selectedResource]);

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
        />
        
        <StepNavigation 
          step={step} 
          stepId={stepId}
          substepTitle={substepTitle}
        />
      </main>
      <Footer />
    </div>
  );
}
