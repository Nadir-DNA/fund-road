
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function RoadmapPage() {
  const { localSteps, isLoading: stepsLoading } = useJourneyProgress(journeySteps);
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
                <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Bienvenue dans votre parcours entrepreneur</h2>
                  <p className="text-gray-400 text-center mb-6">
                    Sélectionnez une étape dans la timeline à gauche pour commencer votre parcours.
                  </p>
                  <div className="flex justify-center">
                    <LoadingIndicator size="lg" />
                  </div>
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
