
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import StepContent from "./StepContent";
import StepNavigation from "./StepNavigation";
import { supabase } from "@/integrations/supabase/client";

export default function StepDetailPage() {
  const { stepId: stepIdParam, substepTitle: substepTitleParam, resource: resourceName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courseContent, setCourseContent] = useState<string | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(false);
  
  const selectedResource = searchParams.get('resource');
  const stepId = parseInt(stepIdParam || "1");
  const substepTitle = substepTitleParam ? decodeURIComponent(substepTitleParam) : null;
  
  // Find the current step from the journey steps
  const step = journeySteps.find(s => s.id === stepId);
  const selectedSubStep = step?.subSteps?.find(s => s.title === substepTitle) || null;
  
  console.log("StepDetail - stepId:", stepId, "substepTitle:", substepTitle, "resourceName:", resourceName || selectedResource);
  console.log("step found:", step?.title);
  console.log("selectedSubStep found:", selectedSubStep?.title);

  // Check if we should show resources tab by default
  useEffect(() => {
    const showResources = localStorage.getItem('showResources') === 'true';
    
    if (showResources) {
      // Clear the flag
      localStorage.removeItem('showResources');
      
      // Update search params to switch to resources tab
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', 'resources');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [navigate, searchParams]);

  // Fetch course content from Supabase
  useEffect(() => {
    const fetchCourseContent = async () => {
      setIsLoadingCourse(true);
      
      try {
        console.log(`Fetching course content for step ${stepId} and substep ${substepTitle || 'main'}`);
        
        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('resource_type', 'course');
        
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        } else {
          query = query.is('substep_title', null);
        }
        
        const { data: courses, error } = await query;
        
        if (error) {
          console.error("Error fetching course content:", error);
          return;
        }
        
        if (courses && courses.length > 0) {
          console.log(`Found ${courses.length} courses from Supabase:`, courses);
          setCourseContent(courses[0].course_content);
        } else {
          console.log("No course content found in Supabase");
          setCourseContent(null);
        }
      } catch (err) {
        console.error("Failed to fetch course content:", err);
      } finally {
        setIsLoadingCourse(false);
      }
    };
    
    fetchCourseContent();
  }, [stepId, substepTitle]);

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
          courseContent={courseContent}
          isLoading={isLoadingCourse}
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
