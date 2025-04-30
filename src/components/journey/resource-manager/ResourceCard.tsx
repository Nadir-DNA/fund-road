
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

// Update Resource interface to include missing properties
interface Resource {
  title: string;
  description: string;
  componentName?: string;
  externalUrl?: string;
  type: string;
}

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
    
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
      setTimeout(() => setIsLoading(false), 300);
      return;
    }

    if (resource.componentName) {
      const encodedSubstep = substepTitle ? `/${encodeURIComponent(substepTitle)}` : '';
      navigate(`/step/${stepId}${encodedSubstep}/resource/${resource.componentName}`);
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
          <span>{resource.type}</span>
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
          ) : resource.externalUrl ? (
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
