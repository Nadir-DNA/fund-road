
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CourseContentDisplayProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
}

export default function CourseContentDisplay({ stepId, substepTitle, stepTitle }: CourseContentDisplayProps) {
  const [courseContent, setCourseContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourseContent = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('course_content')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle ? substepTitle : stepTitle)
          .single();

        if (error) {
          console.error("Error fetching course content:", error);
        } else if (data && data.course_content) {
          setCourseContent(data.course_content);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseContent();
  }, [stepId, substepTitle, stepTitle]);

  const formatCourseContent = () => {
    if (!courseContent) return "";
    
    // Process sections with proper headings and formatting
    let formattedContent = courseContent
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

    // Wrap in paragraph if it doesn't start with a heading or list
    if (!formattedContent.startsWith('<h') && !formattedContent.startsWith('<div class')) {
      formattedContent = '<p class="mb-4">' + formattedContent + '</p>';
    }
    
    return formattedContent;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!courseContent) {
    return null;
  }

  return (
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
      <div dangerouslySetInnerHTML={{ __html: formatCourseContent() }} />
    </div>
  );
}
