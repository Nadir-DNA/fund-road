
import { useState, useRef, useEffect } from "react";
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
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any lingering timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);
  
  const handleResourceClick = () => {
    // Prevent multiple clicks or navigation in progress
    if (isNavigatingRef.current || isLoading) {
      console.log("Navigation already in progress, ignoring click");
      return;
    }
    
    // Set loading state and navigation lock
    setIsLoading(true);
    isNavigatingRef.current = true;
    
    console.log(`Resource clicked: ${resource.title}`);
    
    // Handle external URL resources
    if (resource.url) {
      console.log(`Opening external URL: ${resource.url}`);
      window.open(resource.url, '_blank');
      
      // Reset loading state after a short delay
      clickTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        isNavigatingRef.current = false;
      }, 300);
      
      return;
    }

    // Get component name from resource or fallback to type-based component
    const componentName = resource.componentName || 
      (resource.type === 'course' ? 'CourseContentDisplay' : undefined);
    
    if (componentName && stepId && substepTitle) {
      try {
        console.log(`Navigating to component: ${componentName}`);
        
        // Save current path for back navigation
        saveResourceReturnPath(window.location.pathname + window.location.search);
        
        // Make sure to encode the substep title for the URL
        const encodedSubstep = encodeURIComponent(substepTitle);
        const resourceUrl = `/step/${stepId}/${encodedSubstep}/resource/${componentName}`;
        console.log("Navigating to resource:", resourceUrl);
        
        // For course resources, save content to localStorage
        if (resource.type === 'course' && resource.courseContent) {
          try {
            localStorage.setItem('currentCourseContent', JSON.stringify({
              stepId,
              substepTitle,
              title: resource.title,
              content: resource.courseContent
            }));
            console.log("Course content saved to localStorage");
          } catch (err) {
            console.error("Failed to save course content to localStorage:", err);
          }
        }
        
        // Navigate with a small delay to ensure state is updated
        clickTimeoutRef.current = setTimeout(() => {
          console.log(`Executing navigation to: ${resourceUrl}`);
          navigate(resourceUrl);
          
          // Reset loading state and navigation flag after navigation
          clickTimeoutRef.current = setTimeout(() => {
            if (isNavigatingRef.current) {
              setIsLoading(false);
              isNavigatingRef.current = false;
            }
          }, 500);
        }, 100);
      } catch (err) {
        console.error("Navigation error:", err);
        toast({
          title: "Erreur de navigation",
          description: "Impossible d'accéder à cette ressource",
          variant: "destructive"
        });
        setIsLoading(false);
        isNavigatingRef.current = false;
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
    switch(resource.componentName) {
      case 'MarketSizeEstimator':
        return <FileText className="h-3 w-3 mr-1 text-blue-400" />;
      case 'OpportunityDefinition':
        return <FileText className="h-3 w-3 mr-1 text-green-400" />;
      case 'CompetitiveAnalysisTable':
        return <FileText className="h-3 w-3 mr-1 text-amber-400" />;
      default:
        return <FileText className="h-3 w-3 mr-1" />;
    }
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
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleResourceClick}
          disabled={isLoading || resource.status === 'coming-soon'}
        >
          {isLoading ? (
            <>
              <LoadingIndicator size="sm" className="mr-2" />
              Chargement...
            </>
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
