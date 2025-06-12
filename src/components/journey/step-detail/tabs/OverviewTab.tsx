
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { useCourseMaterials } from "@/hooks/course/useCourseMaterials";

interface OverviewTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  isLoading?: boolean;
  materials?: any[];
}

export default function OverviewTab({
  stepId,
  substepTitle,
  stepTitle,
  isLoading: externalIsLoading
}: OverviewTabProps) {
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);
  
  // Use the course materials hook
  const { materials, isLoading: courseLoading, error, hasCourseContent } = useCourseMaterials(stepId, substepTitle);
  
  const isLoading = externalIsLoading || courseLoading;

  console.log("OverviewTab - Course materials:", {
    stepId,
    substepTitle,
    materialsCount: materials.length,
    hasCourseContent,
    isLoading,
    error
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-3 text-muted-foreground">Chargement du contenu pédagogique...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-medium">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Contenu pédagogique</h3>
          <p className="text-muted-foreground">Aucun contenu de cours disponible pour cette étape.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedMaterial = materials[selectedMaterialIndex];

  return (
    <div className="space-y-6">
      {/* Course navigation header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Book className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Contenu pédagogique</h2>
            <p className="text-sm text-muted-foreground">
              {substepTitle ? `${stepTitle} - ${substepTitle}` : stepTitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasCourseContent ? (
            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Bientôt disponible
            </Badge>
          )}
        </div>
      </div>

      {/* Course material selector */}
      {materials.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {materials.map((material, index) => (
            <Button
              key={material.id}
              variant={selectedMaterialIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMaterialIndex(index)}
              className="text-xs"
            >
              {material.title}
            </Button>
          ))}
        </div>
      )}

      {/* Course content */}
      <Card className={`${!hasCourseContent ? 'border-orange-200/50 bg-orange-50/30' : ''}`}>
        <CardContent className="p-0">
          {selectedMaterial && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{selectedMaterial.title}</h3>
                {!hasCourseContent && (
                  <div className="flex items-center space-x-2 text-orange-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Ce contenu sera bientôt disponible</span>
                  </div>
                )}
              </div>
              
              <div className="prose prose-slate max-w-none">
                <MarkdownContent content={selectedMaterial.course_content || ''} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional resources hint */}
      {!hasCourseContent && (
        <Card className="border-blue-200/50 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">En attendant ce contenu</p>
                <p className="text-blue-700">
                  Vous pouvez explorer l'onglet <strong>Ressources</strong> qui contient des outils pratiques 
                  et des exercices pour avancer sur cette étape de votre parcours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
