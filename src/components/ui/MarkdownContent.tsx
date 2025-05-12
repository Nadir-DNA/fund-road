
import { useMemo } from "react";

export const content = "";

/**
 * Process markdown content with enhanced formatting
 */
export function useProcessMarkdown(markdown: string | undefined) {
  return useMemo(() => {
    if (!markdown) return "";
    
    // Process sections with proper headings and formatting
    return markdown
      // Convert markdown-style headings to HTML headings
      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-medium mt-4 mb-1">$1</h3>')
      
      // Process numbered lists with proper formatting
      .replace(/(\d+\.)\s+(.*?)$/gm, '<div class="list-item"><span class="list-number">$1</span> $2</div>')
      
      // Process bullet points
      .replace(/^\* (.*?)$/gm, '<div class="bullet-item">• $1</div>')
      
      // Process bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Process italics
      .replace(/\_(.*?)\_/g, '<em>$1</em>')
      
      // Handle paragraphs and line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      
      // Clean up any leftover newlines that aren't part of lists
      .replace(/\n(?!<div class)/g, '<br>');
  }, [markdown]);
}

export default function MarkdownContent({ content }: { content: string }) {
  const processedContent = useProcessMarkdown(content);
  
  return (
    <div className="markdown-content">
      <style jsx>{`
        .markdown-content .list-item {
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }
        .markdown-content .list-number {
          font-weight: 600;
          margin-right: 0.25rem;
        }
        .markdown-content .bullet-item {
          margin-bottom: 0.75rem;
          line-height: 1.5;
          padding-left: 0.5rem;
        }
      `}</style>
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: processedContent.startsWith('<p') ? 
            processedContent : 
            `<p class="mb-4">${processedContent}</p>` 
        }} 
      />
    </div>
  );
}
