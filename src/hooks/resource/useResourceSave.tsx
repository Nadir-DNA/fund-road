import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { saveLastPath, saveResourceReturnPath } from "@/utils/navigationUtils";
import { normalizeSubstepTitle } from "@/utils/normalizeSubstepTitle";

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
  const normalizedSubstepTitle = normalizeSubstepTitle(stepId, substepTitle);
  const lastSavedContentRef = useRef('');
  const toastShownRef = useRef(false);
  const saveTimeoutRef = useRef<any>(null);
  const initialSaveCompletedRef = useRef(false);
  const manualSaveRef = useRef(false);
  const savesAttemptedRef = useRef(0);
  const firstRenderRef = useRef(true);
  const redirectedForAuthRef = useRef(false);
  const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Vérifier l'état d'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Mettre en place un écouteur d'état d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
          
          // Si on vient de se connecter et qu'une sauvegarde manuelle était en cours
          if (event === 'SIGNED_IN' && manualSaveRef.current) {
            console.log("Reconnecté après redirection d'authentification, tentative de sauvegarde automatique");
            setTimeout(() => {
              handleManualSave(session);
              manualSaveRef.current = false;
            }, 1000);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);
  
  // Sauter la toute première tentative de sauvegarde pour éviter les boucles d'initialisation
  if (firstRenderRef.current) {
    console.log("Ignorer la première tentative de sauvegarde en raison de l'initialisation");
    lastSavedContentRef.current = JSON.stringify(formData || {});
    firstRenderRef.current = false;
  }
  
  // Fonction pour sauvegarder localement
  const saveLocally = useCallback(() => {
    try {
      const storageKey = `offline_resource_${stepId}_${substepTitle}_${resourceType}`;
      const contentToSave = JSON.stringify(formData || {});
      localStorage.setItem(storageKey, contentToSave);
      lastSavedContentRef.current = contentToSave;
      console.log("Données sauvegardées localement");
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde locale:", error);
      return false;
    }
  }, [formData, stepId, substepTitle, resourceType]);
  
  const handleSave = useCallback(async (session?: any) => {
    console.log("handleSave appelé avec session:", session ? "présente" : "absente");
    
    // Incrémenter le compteur de tentatives pour détecter les boucles
    savesAttemptedRef.current += 1;
    setLastSaveAttempt(new Date());
    
    // Protection contre les boucles de sauvegarde rapides
    if (savesAttemptedRef.current > 3 && !manualSaveRef.current) {
      console.warn("Trop de tentatives de sauvegarde détectées, limitation pour éviter les boucles");
      setTimeout(() => { savesAttemptedRef.current = 0; }, 5000);
      return false;
    }
    
    // Vérifier l'authentification avant de sauvegarder
    if (!session || !session.user) {
      console.error("Pas de session valide disponible, tentative de récupération de la session actuelle");
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          console.log("Session trouvée via getSession");
          session = data.session;
        } else {
          console.error("Pas de session via getSession non plus");
          
          // Sauvegarder localement avant de rediriger
          const savedLocally = saveLocally();
          
          if (!redirectedForAuthRef.current) {
            redirectedForAuthRef.current = true;
            toast({
              title: "Authentification requise",
              description: "Vous devez être connecté pour sauvegarder vos ressources.",
              variant: "destructive",
              duration: 5000
            });
            
            // Sauvegarder le chemin actuel pour la redirection après connexion
            saveLastPath(window.location.pathname);
            // Si c'est une ressource, utiliser saveResourceReturnPath qui a priorité
            if (resourceType) {
              saveResourceReturnPath(window.location.pathname);
            }
            
            // Définir un délai pour la redirection pour que le toast soit visible
            setTimeout(() => navigate("/auth"), 1000);
          }
          return false;
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la session:", err);
        toast({
          title: "Erreur d'authentification",
          description: "Impossible de vérifier votre session. Veuillez vous reconnecter.",
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Ne pas sauvegarder pendant l'initialisation
    if (!initialSaveCompletedRef.current) {
      console.log("Protection de sauvegarde initiale activée, marquée comme terminée");
      initialSaveCompletedRef.current = true;
      return true;
    }
    
    // Vérifier si le contenu a changé pour éviter les sauvegardes inutiles
    const contentSignature = JSON.stringify(formData);
    if (contentSignature === lastSavedContentRef.current) {
      console.log("Contenu inchangé, sauvegarde ignorée");
      return true;
    }
    
    // Ignorer les sauvegardes avec un contenu très petit
    if (contentSignature.length < 10 && !manualSaveRef.current) {
      console.log("Contenu trop minimal, sauvegarde automatique ignorée");
      return true;
    }
    
    setIsSaving(true);
    
    try {
      console.log(`Sauvegarde de la ressource: stepId=${stepId}, substep=${substepTitle}, type=${resourceType}, resourceId=${resourceId}`);
      console.log("ID utilisateur:", session.user.id);
      console.log("Données du formulaire:", formData);
      
      // S'assurer que nous avons un contenu valide à sauvegarder
      if (!formData || typeof formData !== 'object') {
        throw new Error("Données de formulaire invalides pour la sauvegarde");
      }
      
      let result;
      
      if (resourceId) {
        // Mettre à jour l'existant
        console.log(`Mise à jour de la ressource avec ID: ${resourceId}`);
        result = await supabase
          .from('user_resources')
          .update({
            content: formData,
            updated_at: new Date().toISOString(),
            substep_title: normalizedSubstepTitle,
            original_substep_title: substepTitle
          })
          .eq('id', resourceId)
          .select();
          
        console.log("Résultat de la mise à jour:", result);
      } else {
        // Créer une nouvelle ressource
        console.log("Création d'une nouvelle ressource avec user_id:", session.user.id);
        
        // Vérifier d'abord si une ressource existe déjà pour éviter les doublons
        // même si la contrainte d'unicité est en place, c'est plus propre
        const { data: existingResource } = await supabase
          .from('user_resources')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', normalizedSubstepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle();
          
        if (existingResource) {
          console.log("Une ressource existe déjà, mise à jour au lieu de création");
          
          result = await supabase
            .from('user_resources')
            .update({
              content: formData,
              updated_at: new Date().toISOString(),
              substep_title: normalizedSubstepTitle,
              original_substep_title: substepTitle
            })
            .eq('id', existingResource.id)
            .select();
        } else {
          // S'assurer que tous les champs requis sont présents
          const resourceData = {
            user_id: session.user.id,
            step_id: stepId,
            substep_title: normalizedSubstepTitle,
            original_substep_title: substepTitle,
            resource_type: resourceType,
            content: formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("Données de ressource à insérer:", resourceData);
          
          result = await supabase
            .from('user_resources')
            .insert(resourceData)
            .select();
            
          console.log("Résultat de l'insertion:", result);
        }
      }
      
      const { error, data } = result;
      if (error) {
        console.error("Erreur Supabase pendant la sauvegarde:", error);
        toast({
          title: "Erreur de sauvegarde",
          description: `${error.message || "Une erreur est survenue lors de la sauvegarde."}`,
          variant: "destructive"
        });
        
        // Sauvegarder localement en cas d'échec
        saveLocally();
        
        return false;
      }
      
      if (data && data[0]) {
        console.log("Ressource sauvegardée avec succès avec ID:", data[0].id);
        if (onSaved) {
          onSaved(data[0].id);
        }

        // Mettre à jour la signature du dernier contenu sauvegardé
        lastSavedContentRef.current = contentSignature;
        
        // N'afficher un toast que pour les sauvegardes manuelles ou la première sauvegarde réussie
        if ((manualSaveRef.current || !toastShownRef.current) && contentSignature.length > 20) {
          toast({
            title: "Ressource sauvegardée",
            description: "Vos données ont été enregistrées avec succès."
          });
          
          // Définir un drapeau pour éviter d'afficher le toast trop fréquemment
          toastShownRef.current = true;
          manualSaveRef.current = false;
          
          // Réinitialiser le drapeau du toast après un délai plus long
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          
          saveTimeoutRef.current = setTimeout(() => {
            toastShownRef.current = false;
          }, 30000); // 30 secondes pour vraiment réduire la fréquence
        }
        
        // Réinitialiser le compteur de tentatives de sauvegarde après une sauvegarde réussie
        savesAttemptedRef.current = 0;
        return true;
      } else {
        console.error("Aucune donnée retournée de l'opération de sauvegarde");
        throw new Error("Aucune donnée retournée lors de la sauvegarde");
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la ressource:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
      
      // Sauvegarder localement en cas d'échec
      saveLocally();
      
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData, stepId, substepTitle, resourceType, resourceId, navigate, onSaved, setIsSaving, toast, saveLocally]);

  // Marquer une sauvegarde comme "manuelle" (déclenchée par l'utilisateur)
  const handleManualSave = useCallback(async (session?: any) => {
    console.log("Sauvegarde manuelle déclenchée");
    manualSaveRef.current = true;
    // Réinitialiser le compteur de tentatives pour les sauvegardes manuelles
    savesAttemptedRef.current = 0;
    
    // Si pas authentifié, vérifier d'abord
    if (!isAuthenticated) {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Sauvegarder localement avant de rediriger
          saveLocally();
          
          toast({
            title: "Authentification requise",
            description: "Vous devez être connecté pour sauvegarder vos ressources.",
            variant: "destructive",
            duration: 5000
          });
          
          // Sauvegarder les chemins pour redirection
          saveLastPath(window.location.pathname);
          saveResourceReturnPath(window.location.pathname);
          
          // Rediriger vers la page d'authentification
          setTimeout(() => navigate('/auth'), 500);
          return false;
        }
        session = data.session;
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err);
        // Sauvegarde locale en cas d'échec
        return saveLocally();
      }
    }
    
    return handleSave(session);
  }, [handleSave, navigate, toast, isAuthenticated, saveLocally]);

  return { 
    handleSave,
    handleManualSave,
    lastSaveAttempt,
    saveLocally,
    isAuthenticated
  };
}
