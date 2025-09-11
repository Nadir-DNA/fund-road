
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ResourceEmbedProps {
  type: string;
  url: string;
  title: string;
}

export default function ResourceEmbed({ type, url, title }: ResourceEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle different resource types
  const renderResource = () => {
    switch (type.toLowerCase()) {
      case 'notion':
      case 'google_doc':
      case 'iframe':
        return (
          <div className="aspect-video w-full rounded-md overflow-hidden border border-border">
            {isLoading && <Skeleton className="w-full h-full absolute inset-0" />}
            <iframe 
              src={url} 
              title={title}
              className="w-full h-[600px] max-h-[70vh]"
              onLoad={() => setIsLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="aspect-video w-full rounded-md overflow-hidden border border-border">
            {isLoading && <Skeleton className="w-full h-full absolute inset-0" />}
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
              title={title}
              className="w-full h-[600px] max-h-[70vh]"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 rounded-md border border-border">
            <p className="text-muted-foreground mb-4">
              Ce type de ressource ({type}) n'est pas supporté en prévisualisation.
            </p>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                Ouvrir dans un nouvel onglet <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {renderResource()}
    </div>
  );
}
