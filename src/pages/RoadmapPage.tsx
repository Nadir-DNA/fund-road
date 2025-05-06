
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function RoadmapPage() {
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the main roadmap page without a step
  const isMainRoadmap = location.pathname === "/roadmap";
  
  // Redirect to first step if on main roadmap page
  useEffect(() => {
    if (isMainRoadmap && !stepsLoading && localSteps.length > 0) {
      console.log("RoadmapPage - On main roadmap, redirecting to first step");
      
      // Find the first incomplete step, or default to the first step
      const firstIncompleteStep = localSteps.find(step => !step.isCompleted) || localSteps[0];
      
      // Wait a moment to allow the UI to render before navigating
      const timer = setTimeout(() => {
        navigate(`/roadmap/step/${firstIncompleteStep.id}`);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMainRoadmap, stepsLoading, localSteps, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-gray-100">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <section className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Votre parcours entrepreneur</h1>
          
          <JourneyProgressIndicator />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-1">
              {stepsLoading ? (
                <div className="w-full flex justify-center py-12">
                  <LoadingIndicator size="lg" />
                </div>
              ) : (
                <JourneyTimeline />
              )}
            </div>
            
            <div className="lg:col-span-2">
              {isMainRoadmap ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingIndicator size="lg" />
                </div>
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
