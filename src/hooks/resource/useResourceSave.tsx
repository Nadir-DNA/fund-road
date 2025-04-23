
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SaveOptions {
  formData: any;
  stepId: number;
  substepTitle: string;
  resourceType: string;
  resourceId: string | null;
  onSaved?: (id: string) => void;
  setIsSaving: (saving: boolean) => void;
}

export function useResourceSave({
  formData,
  stepId,
  substepTitle,
  resourceType,
  resourceId,
  onSaved,
  setIsSaving
}: SaveOptions) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour sauvegarder vos ressources.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    try {
      let result;
      if (resourceId) {
        // Update existing
        result = await supabase
          .from('user_resources')
          .update({
            content: formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', resourceId)
          .select();
      } else {
        // Insert new - require all fields
        const resourceData = {
          user_id: session.session.user.id,
          step_id: stepId,
          substep_title: substepTitle,
          resource_type: resourceType,
          content: formData
        };
        result = await supabase
          .from('user_resources')
          .insert(resourceData)
          .select();
      }
      const { error, data } = result;
      if (error) throw error;
      if (data && data[0] && onSaved) {
        onSaved(data[0].id);
      }

      toast({
        title: "Ressource sauvegardée",
        description: "Vos données ont été enregistrées avec succès."
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la ressource:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate, onSaved, setIsSaving, toast]);

  return { handleSave };
}
