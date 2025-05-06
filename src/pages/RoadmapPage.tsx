
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { journeySteps } from "@/data/journeySteps";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight } from "lucide-react";

export default function RoadmapPage() {
  const { localSteps, progress, isLoading } = useJourneyProgress(journeySteps);
  const navigate = useNavigate();
  
  const handleStepClick = (stepId: number) => {
    navigate(`/roadmap/step/${stepId}`);
  };
  
  const handleSubstepClick = (stepId: number, substepTitle: string) => {
    navigate(`/roadmap/step/${stepId}/${encodeURIComponent(substepTitle)}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto flex-grow flex items-center justify-center">
          <LoadingIndicator size="lg" />
          <span className="ml-2">Chargement du parcours...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow p-4 md:p-8 pt-20 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Votre parcours entrepreneur</h1>
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <p className="text-lg text-muted-foreground mb-1">Progression globale</p>
                <div className="flex items-center">
                  <p className="font-bold text-xl">{progress.percentage}%</p>
                  <p className="text-sm text-muted-foreground ml-2">
                    ({progress.completedSteps}/{progress.totalSteps} étapes)
                  </p>
                </div>
              </div>
              <Button className="mt-4 md:mt-0" onClick={() => navigate('/roadmap/step/1')}>
                Continuer mon parcours
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </div>

        <div className="space-y-8">
          {localSteps.map((step) => (
            <Card 
              key={step.id}
              className={`transition-all hover:border-primary/50 ${step.isActive ? 'border-primary/70' : ''}`}
            >
              <CardHeader 
                className="cursor-pointer py-4" 
                onClick={() => handleStepClick(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {step.isCompleted && (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <CardTitle className="text-lg md:text-xl">
                      {step.id}. {step.title}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription className="mt-2">
                  {step.description}
                </CardDescription>
              </CardHeader>
              
              {step.subSteps && step.subSteps.length > 0 && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {step.subSteps.map((substep, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-2 text-left"
                        onClick={() => handleSubstepClick(step.id, substep.title)}
                      >
                        <div className="flex items-center w-full">
                          {substep.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mr-2" />
                          )}
                          <div className="truncate">{substep.title}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
