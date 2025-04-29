
import { useEffect, useState, useRef } from "react";
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
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const initialRenderRef = useRef(true);
  
  // Get course content from Supabase only when needed
  const { data: courseContent, isLoading } = useQuery({
    queryKey: ['courseContent', stepId, substepTitle],
    queryFn: async () => {
      if (!isOpen) return '';
      
      console.log('Fetching course content for:', stepId, substepTitle);
      const { data, error } = await supabase
        .from('entrepreneur_resources')
        .select('course_content')
        .eq('step_id', stepId)
        .eq('substep_title', substepTitle)
        .eq('resource_type', 'course')
        .maybeSingle();

      if (error) {
        console.error('Error fetching course content:', error);
        throw error;
      }
      
      console.log('Course content fetched:', data?.course_content ? 'Content available' : 'No content');
      return data?.course_content || '';
    },
    enabled: isOpen, // Only fetch when popover is open
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Gérer explicitement l'ouverture/fermeture du popover avec une protection contre les boucles
  const handleOpenChange = (open: boolean) => {
    console.log("Popover state requested to change to:", open);
    
    // Évite de déclencher des ouvertures/fermetures en boucle
    if (initialRenderRef.current && open) {
      initialRenderRef.current = false;
    }
    
    // Ne mettre à jour l'état que si nécessaire
    if (isOpen !== open) {
      setIsOpen(open);
    }
  };
  
  // Gestionnaire pour la fermeture manuelle avec arrêt de propagation
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div ref={popoverRef}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-2 ${className}`}
            onClick={(e) => {
              // Empêcher la propagation du clic pour éviter les fermetures intempestives
              e.stopPropagation();
              if (!isOpen) {
                setIsOpen(true);
              }
            }}
          >
            <BookOpen className="h-4 w-4" />
            {triggerText}
          </Button>
        </PopoverTrigger>
        
        {isOpen && (
          <PopoverContent 
            className="w-[340px] sm:w-[400px] max-h-[500px] overflow-y-auto p-0"
            side="top" 
            align="start"
            sideOffset={5}
            onInteractOutside={(e) => {
              // Prévention sélective des interactions extérieures
              if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                e.preventDefault();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 rounded-none">
              <div className="flex justify-between items-center p-3 border-b bg-muted/30 sticky top-0 z-[65]">
                <h3 className="font-medium text-sm">Contenu du cours</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleClose}
                  type="button"
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
        )}
      </Popover>
    </div>
  );
}
