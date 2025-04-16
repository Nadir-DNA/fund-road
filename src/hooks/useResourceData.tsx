
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Type pour les données de ressource utilisateur
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
  const [resourceId, setResourceId] = useState<string | null>(null);
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
        // Vérifier d'abord dans la table user_resources (ressources personnalisées)
        const { data: userResource, error: userError } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (userResource) {
          setFormData(userResource.content || {});
          setResourceId(userResource.id);
          if (onDataSaved) onDataSaved(userResource.content || {});
          setIsLoading(false);
          return;
        }
        
        // Si aucune ressource personnalisée, vérifier les ressources prédéfinies
        const { data: templateResource, error: templateError } = await supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
        
        if (templateResource && templateResource.course_content) {
          try {
            // Si le contenu est stocké sous forme de JSON
            const parsedContent = typeof templateResource.course_content === 'string' 
              ? JSON.parse(templateResource.course_content) 
              : templateResource.course_content;
            
            setFormData(parsedContent);
            if (onDataSaved) onDataSaved(parsedContent);
          } catch (e) {
            console.error("Erreur lors du parsing du contenu de la ressource:", e);
            // Si ce n'est pas du JSON valide, utiliser comme texte brut
            setFormData({ content: templateResource.course_content });
            if (onDataSaved) onDataSaved({ content: templateResource.course_content });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
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
      
      if (resourceId) {
        resourceData.id = resourceId;
      }
      
      const { error, data } = await supabase
        .from('user_resources')
        .upsert(resourceData, { 
          onConflict: 'user_id,step_id,substep_title,resource_type'
        }).select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        setResourceId(data[0].id);
      }
      
      toast({
        title: "Ressource sauvegardée",
        description: "Vos données ont été enregistrées avec succès."
      });
      
      if (onDataSaved) onDataSaved(safeFormData);
      
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
  };

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData,
    resourceId
  };
};
