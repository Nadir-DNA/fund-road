
import React, { lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResourceComponentProps } from '../resourceComponentsMap';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

interface CourseContentDisplayProps extends ResourceComponentProps {
  courseContent?: string;
  stepTitle?: string;
}

// Define a more specific type for the code component props
interface CodeProps {
  node: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const LazyMarkdown = ({ content }: { content: string }) => (
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
      h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
      h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
      p: ({ node, ...props }) => <p className="my-2" {...props} />,
      ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
      li: ({ node, ...props }) => <li className="my-1" {...props} />,
      a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} target="_blank" rel="noopener noreferrer" />,
      blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic my-3" {...props} />,
      code: ({ node, inline, ...props }: CodeProps) => 
        inline ? 
          <code className="bg-slate-700 px-1 rounded text-sm" {...props} /> : 
          <pre className="bg-slate-700 p-3 rounded my-3 overflow-auto"><code {...props} /></pre>
    }}
  >
    {content}
  </ReactMarkdown>
);

export default function CourseContentDisplay({ 
  stepId, 
  substepTitle, 
  courseContent,
  stepTitle
}: CourseContentDisplayProps) {
  // If no content is provided, show placeholder
  if (!courseContent) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-muted-foreground text-center">
          Le contenu du cours n'est pas disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <div className="prose prose-invert max-w-none">
          <Suspense fallback={
            <div className="flex items-center justify-center p-6">
              <LoadingIndicator size="sm" />
              <span className="ml-2 text-muted-foreground">Chargement du contenu...</span>
            </div>
          }>
            <LazyMarkdown content={courseContent} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}
