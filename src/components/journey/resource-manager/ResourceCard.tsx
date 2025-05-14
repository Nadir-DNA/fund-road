
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { buildResourceUrl, saveResourceReturnPath } from "@/utils/navigationUtils";
import { supabase } from "@/integrations/supabase/client";

interface ResourceCardProps {
  resource: any;
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
  onClick?: () => void;
}

export default function ResourceCard({ 
  resource, 
  stepId, 
  substepTitle,
  subsubstepTitle,
  onClick 
}: ResourceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check if the user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    checkUser();
  }, []);
  
  const handleResourceClick = async () => {
    // If onClick callback provided, use that directly
    if (onClick) {
      onClick();
      return;
    }
    
    if (isLoading) return;
    setIsLoading(true);
    
    // If there's a direct URL, open it
    if (resource.file_url) {
      console.log("Opening external resource:", resource.file_url);
      window.open(resource.file_url, '_blank');
      setTimeout(() => setIsLoading(false), 300);
      return;
    }

    // Check if user is authenticated for protected resources
    if (!userId) {
      console.log("User is not authenticated");
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour accéder à cette ressource.",
        variant: "destructive"
      });
      
      // Save the current path for redirecting back after login
      saveResourceReturnPath(window.location.pathname);
      setTimeout(() => {
        setIsLoading(false);
        navigate("/auth");
      }, 100);
      return;
    }

    // Check if this resource has a component to display
    if (resource.componentName || resource.component_name) {
      const componentName = resource.componentName || resource.component_name;
      console.log("Navigating to component resource:", componentName);
      try {
        // Record the resource access in user_resources if it doesn't exist yet
        try {
          // Check if the resource already exists for this user
          const { data: existingResource } = await supabase
            .from('user_resources')
            .select('id')
            .eq('user_id', userId)
            .eq('step_id', stepId)
            .eq('substep_title', substepTitle)
            .eq('resource_type', resource.resource_type || resource.type || 'resource')
            .maybeSingle();
            
          // If the resource doesn't exist, create an initial entry
          if (!existingResource) {
            await supabase
              .from('user_resources')
              .insert({
                user_id: userId,
                step_id: stepId,
                substep_title: substepTitle,
                resource_type: resource.resource_type || resource.type || 'resource',
                content: {}
              });
            
            console.log("Created new user resource entry");
          } else {
            console.log("User resource entry already exists:", existingResource.id);
          }
        } catch (err) {
          console.error("Error creating resource entry:", err);
          // Continue even if this fails
        }
        
        // Save current path for potential return
        saveResourceReturnPath(window.location.pathname);
        
        // Build the resource URL
        const resourceUrl = buildResourceUrl(stepId, substepTitle, componentName);
        
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
