
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LazyMarkdown } from "@/components/ui/LazyMarkdown";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useUnifiedCourseMaterials } from "@/hooks/course/useUnifiedCourseMaterials";

interface CourseSectionProps {
  stepId: number;
  substepTitle: string | null;
  resourceTitle: string;
}

export default function CourseSection({ stepId, substepTitle, resourceTitle }: CourseSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: materials, isLoading, error } = useUnifiedCourseMaterials(stepId, substepTitle);

  // Find course content in materials
  const course = materials?.find(m => m.resource_type === 'course');

  console.log(`📚 CourseSection - Step ${stepId}, Substep: ${substepTitle || 'main'}, Course found: ${!!course}`);

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  Cours - {course?.title || resourceTitle}
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Théorie
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isOpen ? "Cliquez pour masquer le contenu du cours" : "Cliquez pour afficher le contenu du cours"}
            </p>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingIndicator size="lg" />
                <span className="ml-2">Chargement du cours...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-destructive">
                <p>Erreur lors du chargement du cours</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Étape {stepId} - {substepTitle || 'Étape principale'}
                </p>
              </div>
            ) : course?.course_content ? (
              <div className="prose prose-invert max-w-none">
                <LazyMarkdown content={course.course_content} />
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Contenu du cours en préparation</p>
                <p className="text-sm mt-1">
                  Le contenu pour "{substepTitle || resourceTitle}" sera disponible prochainement
                </p>
                <p className="text-xs mt-2 text-muted-foreground/70">
                  Étape {stepId} - {substepTitle || 'Étape principale'}
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
