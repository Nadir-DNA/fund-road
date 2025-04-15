
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-1" /> Télécharger
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Ouvrir
            </a>
          </Button>
        </div>
      </div>
      
      <div className="relative w-full aspect-[4/3] border border-border rounded-md overflow-hidden">
        {isLoading && <Skeleton className="absolute inset-0 z-10" />}
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          title={title}
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
