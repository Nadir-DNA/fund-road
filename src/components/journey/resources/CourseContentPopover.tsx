
import { useState, useCallback, useRef, useEffect } from "react";
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
  const popoverRef = useRef<HTMLDivElement>(null);
  const clickInsideRef = useRef(false);
  
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
    enabled: isOpen, // Only fetch when popover is open
  });

  // Handle opening and closing
  const handleOpenChange = useCallback((open: boolean) => {
    console.log("Popover state changing to:", open);
    
    // Only change state if we're opening or this is an intentional close
    if (open || !clickInsideRef.current) {
      setIsOpen(open);
    }
    
    clickInsideRef.current = false;
  }, []);

  // Click handler for the trigger button
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clickInsideRef.current = true;
    console.log("Trigger button clicked, toggling popover");
    setIsOpen(prev => !prev);
  };

  // Close button handler
  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clickInsideRef.current = false;
    console.log("Close button clicked");
    setIsOpen(false);
  };

  // Prevent internal clicks from closing the popover
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickInsideRef.current = true;
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && 
          !popoverRef.current.contains(event.target as Node) && 
          isOpen && 
          !clickInsideRef.current) {
        console.log("Click outside detected, closing popover");
        setIsOpen(false);
        clickInsideRef.current = false;
      }
    };

    if (isOpen) {
      // Use a timeout to add listener after current event loop completes
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [isOpen]);

  return (
    <Popover 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 ${className}`}
          onClick={handleTriggerClick}
        >
          <BookOpen className="h-4 w-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-[340px] sm:w-[400px] max-h-[500px] overflow-y-auto p-0 z-[9999]" 
        side="top" 
        align="start"
        sideOffset={5}
        avoidCollisions={true}
        onClick={handleContentClick}
      >
        <Card className="border-0 rounded-none">
          <div className="flex justify-between items-center p-3 border-b bg-muted/30 sticky top-0 z-10">
            <h3 className="font-medium text-sm">Contenu du cours</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleCloseClick}
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
