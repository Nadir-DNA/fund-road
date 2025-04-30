
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Resource } from "@/types/journey";

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
  
  const handleResourceClick = () => {
    setIsLoading(true);
    
    if (resource.url) {
      window.open(resource.url, '_blank');
      setTimeout(() => setIsLoading(false), 300);
      return;
    }

    if (resource.componentName) {
      // Make sure to encode the substep title for the URL
      const encodedSubstep = substepTitle ? `/${encodeURIComponent(substepTitle)}` : '';
      const resourceUrl = `/step/${stepId}${encodedSubstep}/resource/${resource.componentName}`;
      console.log("Navigating to resource:", resourceUrl);
      navigate(resourceUrl);
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <Card className="group transition-all duration-200 border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{resource.title}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <FileText className="h-3 w-3 mr-1" />
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
          disabled={isLoading || resource.status === 'coming-soon'}
        >
          {isLoading ? (
            <LoadingIndicator size="sm" />
          ) : resource.url ? (
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
