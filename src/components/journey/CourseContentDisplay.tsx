
import React, { useMemo } from "react";
import LazyLoad from "../LazyLoad";

interface CourseContentDisplayProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
}

const CourseContentDisplay = ({ stepId, substepTitle, stepTitle }: CourseContentDisplayProps) => {
  // Fetch is now handled by the parent component using React Query
  
  // Memoize the formatted content to prevent unnecessary re-rendering
  const formattedContent = useMemo(() => {
    if (!window.courseContent) return "";
    
    const content = window.courseContent;
    
    // Process sections with proper headings and formatting
    return content
      // Convert markdown-style headings to HTML headings
      .replace(/^# (.*?)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^## (.*?)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
      .replace(/^### (.*?)$/gm, '<h4 class="text-base font-medium mt-4 mb-1">$1</h4>')
      
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
  }, [window.courseContent]);

  return (
    <LazyLoad height={400}>
      <div className="prose prose-sm max-w-none course-content">
        <style>
          {`
          .course-content .list-item {
            margin-bottom: 0.75rem;
            line-height: 1.5;
          }
          .course-content .list-number {
            font-weight: 600;
            margin-right: 0.25rem;
          }
          .course-content .bullet-item {
            margin-bottom: 0.75rem;
            line-height: 1.5;
            padding-left: 0.5rem;
          }
          .course-content strong {
            font-weight: 600;
          }
          .course-content h2, .course-content h3, .course-content h4 {
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .course-content p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }
          `}
        </style>
        <div dangerouslySetInnerHTML={{ __html: formattedContent.startsWith('<p') ? formattedContent : `<p class="mb-4">${formattedContent}</p>` }} />
      </div>
    </LazyLoad>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CourseContentDisplay);
