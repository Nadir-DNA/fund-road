
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, FileText, BookOpenCheck } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Resource } from "@/types/journey";
import { toast } from "@/components/ui/use-toast";
import { saveResourceReturnPath } from "@/utils/navigationUtils";

interface ResourceCardProps {
  resource: Resource;
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

export default function ResourceCard({
  resource,
  stepId,
  substepTitle,
  subsubstepTitle
}: ResourceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);
  
  const handleResourceClick = () => {
    if (isNavigatingRef.current) return; // Prevent multiple clicks
    
    setIsLoading(true);
    isNavigatingRef.current = true;
    
    if (resource.url) {
      window.open(resource.url, '_blank');
      setTimeout(() => {
        setIsLoading(false);
        isNavigatingRef.current = false;
      }, 300);
      return;
    }

    const componentName = resource.componentName || (resource.type === 'course' ? 'CourseContentDisplay' : undefined);
    
    if (componentName) {
      try {
        // Save current path for back navigation
        saveResourceReturnPath(window.location.pathname + window.location.search);
        
        // Make sure to encode the substep title for the URL
        const encodedSubstep = substepTitle ? `/${encodeURIComponent(substepTitle)}` : '';
        const resourceUrl = `/step/${stepId}${encodedSubstep}/resource/${componentName}`;
        console.log("Navigating to resource:", resourceUrl);
        
        // Add the resource itself to localStorage to ensure its data is available
        if (resource.type === 'course' && resource.courseContent) {
          try {
            localStorage.setItem('currentCourseContent', JSON.stringify({
              stepId,
              substepTitle,
              title: resource.title,
              content: resource.courseContent
            }));
          } catch (err) {
            console.error("Failed to save course content to localStorage:", err);
          }
        }
        
        navigate(resourceUrl);
      } catch (err) {
        console.error("Navigation error:", err);
        toast({
          title: "Erreur de navigation",
          description: "Impossible d'accéder à cette ressource",
          variant: "destructive"
        });
      } finally {
        // Reset state after a delay
        setTimeout(() => {
          setIsLoading(false);
          isNavigatingRef.current = false;
        }, 500);
      }
    } else {
      toast({
        title: "Ressource non disponible",
        description: "Cette ressource n'a pas de composant associé.",
        variant: "destructive"
      });
      setIsLoading(false);
      isNavigatingRef.current = false;
    }
  };

  // Define the icon based on resource type
  const getResourceIcon = () => {
    if (resource.type === 'course') {
      return <BookOpenCheck className="h-3 w-3 mr-1" />;
    }
    return <FileText className="h-3 w-3 mr-1" />;
  };

  return (
    <Card className="group transition-all duration-200 border hover:border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{resource.title}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          {getResourceIcon()}
          <span>{resource.type || 'resource'}</span>
          {resource.componentName && <span className="ml-1 text-xs opacity-50">({resource.componentName})</span>}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleResourceClick}
          disabled={isLoading || resource.status === 'coming-soon' || isNavigatingRef.current}
        >
          {isLoading ? (
            <LoadingIndicator size="sm" />
          ) : resource.url ? (
            <>
              Voir <ExternalLink className="ml-1 h-3 w-3" />
            </>
          ) : resource.type === 'course' ? (
            <>
              <BookOpen className="mr-1 h-3 w-3" /> Ouvrir le cours
            </>
          ) : (
            "Ouvrir"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
