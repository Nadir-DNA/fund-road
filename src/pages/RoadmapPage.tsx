
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function RoadmapPage() {
  const {
    localSteps,
    isLoading: stepsLoading
  } = useJourneyProgress(journeySteps);
  const location = useLocation();

  // Check if we're on the main roadmap page without a step
  const isMainRoadmap = location.pathname === "/roadmap";
  
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <section className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Votre parcours entrepreneur</h1>
          
          <JourneyProgressIndicator />
          
          <div className="w-full mt-8">
            {stepsLoading ? (
              <div className="w-full flex justify-center py-12">
                <LoadingIndicator size="lg" />
              </div>
            ) : (
              <JourneyTimeline />
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
