
import React, { useState, useEffect } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

interface LazyMarkdownProps {
  content: string;
}

export function LazyMarkdown({ content }: LazyMarkdownProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate loading process for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [content]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <LoadingIndicator size="sm" />
        <span className="ml-2 text-muted-foreground">Préparation du contenu...</span>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-destructive p-4">{error}</div>;
  }
  
  return <>{content}</>;
}

export { content } from "./MarkdownContent";
