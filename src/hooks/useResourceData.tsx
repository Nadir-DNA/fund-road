
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  defaultValues?: any,
  onDataSaved?: (data: any) => void
) => {
  // Stocke les valeurs initiales de manière stable
  const initialValues = useMemo(() => defaultValues || {}, []);
  const [formData, setFormData] = useState(initialValues);
  
  // Initialise une seule fois au montage avec les valeurs initiales
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && onDataSaved) {
      onDataSaved(initialValues);
    }
  }, []);

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
          const content = userResource.content || {};
          setFormData(content);
          setResourceId(userResource.id);
          if (onDataSaved) onDataSaved(content);
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
            const content = { content: templateResource.course_content };
            setFormData(content);
            if (onDataSaved) onDataSaved(content);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedData();
  }, [stepId, substepTitle, resourceType]);

  // Handle form field changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (onDataSaved) onDataSaved(updated);
      return updated;
    });
  }, [onDataSaved]);

  // Save form data to database
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
      const currentFormData = formData;
      
      const resourceData: Partial<UserResource> = {
        user_id: session.session.user.id,
        step_id: stepId,
        substep_title: substepTitle,
        resource_type: resourceType,
        content: currentFormData,
      };
      
      // Solution: Utiliser des méthodes différentes selon qu'il s'agit d'une insertion ou d'une mise à jour
      let result;
      
      if (resourceId) {
        // Mise à jour d'une ressource existante
        result = await supabase
          .from('user_resources')
          .update({
            content: currentFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', resourceId)
          .select();
      } else {
        // Insertion d'une nouvelle ressource
        result = await supabase
          .from('user_resources')
          .insert(resourceData)
          .select();
      }
      
      const { error, data } = result;
        
      if (error) throw error;
      
      if (data && data[0]) {
        setResourceId(data[0].id);
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
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate]);

  return {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    setFormData
  };
};
