
import React, { lazy, Suspense, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import LazyLoad from "@/components/LazyLoad";

interface CourseContentDisplayProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  courseContent?: string;
}

// Define types for markdown components
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Enhanced markdown renderer with optimized components
const EnhancedMarkdown = ({ content }: { content: string }) => {
  // Memoize the markdown content to prevent unnecessary re-renders
  const memoizedContent = useMemo(() => content, [content]);
  
  if (!content) {
    return <p className="text-muted-foreground text-center">Contenu non disponible</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-invert max-w-none"
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
        code: ({ node, inline, className, children, ...props }: CodeProps) => 
          inline ? 
            <code className="bg-slate-700 px-1 rounded text-sm" {...props}>{children}</code> : 
            <pre className="bg-slate-700 p-3 rounded my-3 overflow-auto">
              <code className="text-sm" {...props}>{children}</code>
            </pre>,
        table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse" {...props} /></div>,
        thead: ({ node, ...props }) => <thead className="bg-slate-700/50" {...props} />,
        th: ({ node, ...props }) => <th className="border border-slate-600 px-4 py-2 text-left" {...props} />,
        td: ({ node, ...props }) => <td className="border border-slate-600 px-4 py-2" {...props} />,
        img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-md my-4" {...props} alt={props.alt || 'Image'} />
      }}
    >
      {memoizedContent}
    </ReactMarkdown>
  );
};

// Lazy-loaded markdown component with Suspense fallback
const LazyMarkdown = lazy(() => import("../ui/LazyMarkdown").then(module => ({ default: () => <EnhancedMarkdown content={module.content} /> })));

export default function CourseContentDisplay({ 
  stepId, 
  substepTitle, 
  stepTitle,
  courseContent = ""
}: CourseContentDisplayProps) {
  console.log(`CourseContentDisplay - Rendering for step ${stepId}, substep: ${substepTitle || 'main'}, content length: ${courseContent?.length || 0}`);

  // Alert if content is missing
  React.useEffect(() => {
    if (!courseContent?.trim()) {
      console.warn(`CourseContentDisplay - No content for step ${stepId}, ${substepTitle || stepTitle}`);
    }
  }, [courseContent, stepId, substepTitle, stepTitle]);

  // If no content is provided, show placeholder
  if (!courseContent || courseContent.trim().length === 0) {
    return (
      <Card className="w-full bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Le contenu du cours n'est pas disponible pour le moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <LazyLoad height={300} priority={true} className="prose prose-invert max-w-none">
          <Suspense fallback={
            <div className="flex items-center justify-center p-6">
              <LoadingIndicator size="sm" />
              <span className="ml-2 text-muted-foreground">Chargement du contenu...</span>
            </div>
          }>
            <EnhancedMarkdown content={courseContent} />
          </Suspense>
        </LazyLoad>
      </CardContent>
    </Card>
  );
}
