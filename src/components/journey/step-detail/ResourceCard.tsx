
import { Resource } from "@/types/journey";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Book, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceCardProps {
  resource: Resource;
  onClick?: () => void;
}

export default function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const getIcon = () => {
    switch(resource.type) {
      case 'course':
        return <Book className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <Card 
      className="hover:border-primary/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col">
        <div className="flex items-center mb-2">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            {getIcon()}
          </div>
          <h3 className="font-medium text-base">{resource.title}</h3>
        </div>
        
        {resource.description && (
          <p className="text-muted-foreground text-sm mb-3">{resource.description}</p>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="self-end mt-auto"
        >
          Accéder <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
