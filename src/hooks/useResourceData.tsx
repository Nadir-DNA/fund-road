
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Type for user resource data
interface UserResource {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  resource_type: string;
  content: any;
  created_at?: string;
  updated_at?: string;
}

export const useResourceData = (
  stepId: number,
  substepTitle: string,
  resourceType: string,
  defaultValues: any = {},
  onDataSaved?: (data: any) => void
) => {
  const [formData, setFormData] = useState<any>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch saved data on component mount
  useEffect(() => {
    const fetchSavedData = async () => {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching data:", error);
        }
        
        if (data) {
          const resourceData = data as UserResource;
          setFormData(resourceData.content || {});
          if (onDataSaved) onDataSaved(resourceData.content || {});
        }
      } catch (error) {
        console.error("Error fetching saved data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedData();
  }, [stepId, substepTitle, resourceType, onDataSaved]);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save form data to database
  const handleSave = async () => {
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
      const safeFormData = formData || {};
      
      const resourceData: UserResource = {
        user_id: session.session.user.id,
        step_id: stepId,
        substep_title: substepTitle,
        resource_type: resourceType,
        content: safeFormData,
      };
      
      const { error } = await supabase
        .from('user_resources')
        .upsert(resourceData, { 
          onConflict: 'user_id,step_id,substep_title,resource_type'
        });
        
      if (error) throw error;
      
      toast({
        title: "Ressource sauvegardée",
        description: "Vos données ont été enregistrées avec succès."
      });
      
      if (onDataSaved) onDataSaved(safeFormData);
      
    } catch (error: any) {
      console.error("Error saving resource:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData
  };
};
