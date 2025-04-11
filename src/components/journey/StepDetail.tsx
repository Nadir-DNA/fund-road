
import { useState, useEffect } from "react";
import { Step, SubStep, Resource } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ResourceManager from "./ResourceManager";

interface StepDetailProps {
  step: Step;
  selectedSubStep: SubStep | null;
}

export default function StepDetail({ step, selectedSubStep }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedSubStep ? "resources" : "overview");
  const [courseContent, setCourseContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseContent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('course_content')
          .eq('step_id', step.id)
          .eq('substep_title', selectedSubStep ? selectedSubStep.title : step.title)
          .single();

        if (error) {
          console.error("Error fetching course content:", error);
        } else if (data && data.course_content) {
          setCourseContent(data.course_content);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseContent();
  }, [step.id, selectedSubStep]);

  const formatCourseContent = () => {
    if (!courseContent) return "";
    
    // Process sections with proper headings and formatting
    let formattedContent = courseContent
      // Convert markdown-style headings to HTML headings
      .replace(/^# (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^## (.*?)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
      .replace(/^### (.*?)$/gm, '<h4 class="text-base font-medium mt-4 mb-1">$1</h4>')
      
      // Process numbered lists with proper formatting
      .replace(/(\d+\.)\s+(.*?)$/gm, '<div class="list-item"><span class="list-number">$1</span> $2</div>')
      
      // Process bullet points
      .replace(/^\* (.*?)$/gm, '<div class="bullet-item">• $1</div>')
      
      // Process bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Process italics
      .replace(/\_(.*?)\_/g, '<em>$1</em>')
      
      // Handle paragraphs and line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      
      // Clean up any leftover newlines that aren't part of lists
      .replace(/\n(?!<div class)/g, '<br>');

    // Wrap in paragraph if it doesn't start with a heading or list
    if (!formattedContent.startsWith('<h') && !formattedContent.startsWith('<div class')) {
      formattedContent = '<p class="mb-4">' + formattedContent + '</p>';
    }
    
    return formattedContent;
  };

  return (
    <div className="px-2">
      <DialogHeader className="mb-6">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>
        <DialogDescription>
          {selectedSubStep ? selectedSubStep.description : step.description}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="help">Aide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : courseContent ? (
            <div className="prose prose-sm max-w-none course-content">
              <style>
                {`
                .course-content .list-item {
                  margin-bottom: 0.75rem;
                  line-height: 1.5;
                }
                .course-content .list-number {
                  font-weight: 600;
                  margin-right: 0.25rem;
                }
                .course-content .bullet-item {
                  margin-bottom: 0.75rem;
                  line-height: 1.5;
                  padding-left: 0.5rem;
                }
                .course-content strong {
                  font-weight: 600;
                }
                .course-content h2, .course-content h3, .course-content h4 {
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  font-weight: 600;
                }
                .course-content p {
                  margin-bottom: 1rem;
                  line-height: 1.6;
                }
                `}
              </style>
              <div dangerouslySetInnerHTML={{ __html: formatCourseContent() }} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description détaillée</h3>
                <p className="text-muted-foreground">{step.detailedDescription}</p>
              </div>
              
              {selectedSubStep ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sous-étape sélectionnée</h3>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">{selectedSubStep.title}</h4>
                    <p className="text-muted-foreground mt-1">{selectedSubStep.description}</p>
                  </div>
                </div>
              ) : step.subSteps && step.subSteps.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sous-étapes</h3>
                  <div className="space-y-3">
                    {step.subSteps.map((subStep, i) => (
                      <li key={i} className="p-4 border rounded-lg list-none">
                        <h4 className="font-medium">{subStep.title}</h4>
                        <p className="text-muted-foreground mt-1">{subStep.description}</p>
                      </li>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="resources" className="py-4">
          <ResourceManager 
            step={step} 
            selectedSubstepTitle={selectedSubStep?.title}
          />
        </TabsContent>
        
        <TabsContent value="help" className="py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ressources d'aide</h3>
            <p className="text-muted-foreground">
              Consultez ces ressources pour vous aider à compléter cette étape de votre parcours entrepreneurial.
            </p>
            
            {step.resources && step.resources.length > 0 ? (
              <div className="space-y-3 mt-4">
                {step.resources.map((resource, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{resource.description}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => resource.url ? window.open(resource.url, '_blank') : null}
                      disabled={!resource.url}
                    >
                      {resource.url ? 'Accéder à la ressource' : 'Ressource non disponible'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border rounded-lg text-center text-muted-foreground">
                Aucune ressource d'aide supplémentaire n'est disponible pour le moment.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
