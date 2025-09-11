
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoadmapTimeline from "@/components/journey/RoadmapTimeline";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-gray-100">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto flex h-full">
          {/* Timeline sidebar */}
          <RoadmapTimeline />
          
          {/* Content area - where SubstepPage will be rendered */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
