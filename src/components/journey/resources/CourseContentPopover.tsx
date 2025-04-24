
import { useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface CourseContentPopoverProps {
  stepId: number;
  substepTitle: string;
  triggerText: string;
  className?: string;
}

export default function CourseContentPopover({
  stepId,
  substepTitle,
  triggerText,
  className
}: CourseContentPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close the popover when clicking outside
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  // Get course content from Supabase
  const { data: courseContent, isLoading } = useQuery({
    queryKey: ['courseContent', stepId, substepTitle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entrepreneur_resources')
        .select('course_content')
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', 'course')
        .maybeSingle();

      if (error) throw error;
      return data?.course_content || '';
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${className}`}
          onClick={(e) => {
            e.preventDefault(); // Prevent propagation that might affect forms
            e.stopPropagation(); // Stop propagation to parent elements
          }}
        >
          <BookOpen className="h-4 w-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[340px] sm:w-[400px] max-h-[500px] overflow-y-auto p-0 z-[100]" 
        side="top" 
        align="start"
        onClick={(e) => e.stopPropagation()} // Prevent propagation
      >
        <Card className="border-0 rounded-none">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-medium text-sm">Contenu du cours</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
          
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <LoadingIndicator size="sm" />
              </div>
            ) : courseContent ? (
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: courseContent as string }} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Aucun contenu de cours disponible pour cette section.</span>
              </div>
            )}
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
