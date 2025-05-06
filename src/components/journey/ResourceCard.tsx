
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";

interface ResourceCardProps {
  resource: any;
  stepId: number;
  substepTitle: string;
}

export default function ResourceCard({ resource, stepId, substepTitle }: ResourceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleResourceClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    
    // If there's a direct URL, open it
    if (resource.file_url) {
      console.log("Opening external resource:", resource.file_url);
      window.open(resource.file_url, '_blank');
      setTimeout(() => setIsLoading(false), 300);
      return;
    }

    // Check if this resource has a component to display
    if (resource.componentName) {
      console.log("Navigating to component resource:", resource.componentName);
      try {
        // Save current path for potential return
        saveResourceReturnPath(window.location.pathname);
        
        // Build the resource URL
        const resourceUrl = buildResourceUrl(stepId, substepTitle, resource.componentName);
        
        // Add a small delay to avoid race conditions
        setTimeout(() => {
          navigate(resourceUrl);
          // Reset loading state after navigating
          setTimeout(() => setIsLoading(false), 200);
        }, 100);
      } catch (error) {
        console.error("Navigation error:", error);
        toast({
          title: "Erreur de navigation",
          description: "Impossible d'accéder à cette ressource.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
      return;
    }
    
    // Fallback if neither URL nor component name is available
    toast({
      title: "Ressource non disponible",
      description: "Cette ressource n'a pas de contenu associé.",
      variant: "destructive"
    });
    
    setIsLoading(false);
  };

  // Define the icon based on resource type
  const getResourceIcon = () => {
    switch(resource.resource_type || resource.type) {
      case 'document':
        return <FileText className="h-3 w-3 mr-1" />;
      case 'course':
        return <BookOpen className="h-3 w-3 mr-1" />;
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
          <span>{resource.resource_type || resource.type || 'resource'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleResourceClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoadingIndicator size="sm" />
          ) : resource.file_url ? (
            <>
              Voir <ExternalLink className="ml-1 h-3 w-3" />
            </>
          ) : (
            "Ouvrir"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
