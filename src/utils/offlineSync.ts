
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Synchronise les données qui étaient enregistrées hors ligne
 * lorsque la connexion est rétablie
 */
export async function synchronizeOfflineData() {
  try {
    // Vérifier si l'utilisateur est authentifié
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      console.log("Pas de session, impossible de synchroniser les données hors ligne");
      return { success: false, reason: "not_authenticated" };
    }

    const userId = data.session.user.id;
    let syncCount = 0;
    let errorCount = 0;

    // Parcourir le localStorage pour trouver les éléments à synchroniser
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith("offline_resource_")) {
        try {
          const storedData = localStorage.getItem(key);
          if (!storedData) continue;
          
          const parsedData = JSON.parse(storedData);
          
          // Extraire les informations de la ressource depuis la clé
          // format: offline_resource_${stepId}_${substepTitle}_${resourceType}
          const keyParts = key.split("_");
          if (keyParts.length < 4) continue;
          
          const stepId = parseInt(keyParts[2], 10);
          const resourceType = keyParts[keyParts.length - 1];
          // Reconstruire le substepTitle (qui peut contenir des underscores)
          const substepTitle = keyParts.slice(3, keyParts.length - 1).join("_");
          
          if (isNaN(stepId) || !substepTitle || !resourceType) continue;
          
          console.log("Synchronisation de la ressource:", { stepId, substepTitle, resourceType });
          
          // Vérifier si la ressource existe déjà
          const { data: existingResource, error: checkError } = await supabase
            .from('user_resources')
            .select('id')
            .eq('user_id', userId)
            .eq('step_id', stepId)
            .eq('substep_title', substepTitle)
            .eq('resource_type', resourceType)
            .maybeSingle();
            
          if (checkError) {
            console.error("Erreur lors de la vérification de la ressource:", checkError);
            errorCount++;
            continue;
          }
          
          // Supprimer les métadonnées hors ligne avant la sauvegarde
          const contentToSave = { ...parsedData };
          delete contentToSave.offlineMode;
          delete contentToSave._offlineLoadTime;
          delete contentToSave._offlineSaved;
          delete contentToSave._pendingAuth;
          delete contentToSave._authRedirectTime;
          delete contentToSave._newResource;
          delete contentToSave._error;
          
          if (existingResource) {
            // Mettre à jour la ressource existante
            const { error: updateError } = await supabase
              .from('user_resources')
              .update({
                content: contentToSave,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingResource.id);
              
            if (updateError) {
              console.error("Erreur lors de la mise à jour de la ressource:", updateError);
              errorCount++;
              continue;
            }
          } else {
            // Créer une nouvelle ressource
            const { error: insertError } = await supabase
              .from('user_resources')
              .insert({
                user_id: userId,
                step_id: stepId,
                substep_title: substepTitle,
                resource_type: resourceType,
                content: contentToSave,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error("Erreur lors de la création de la ressource:", insertError);
              errorCount++;
              continue;
            }
          }
          
          syncCount++;
          
          // On ne supprime pas l'élément du localStorage pour avoir une sauvegarde locale
          // mais on met à jour la version locale pour indiquer qu'elle est synchronisée
          localStorage.setItem(key, JSON.stringify({
            ...contentToSave,
            _synced: true,
            _syncTime: new Date().toISOString()
          }));
        } catch (itemError) {
          console.error("Erreur lors de la synchronisation d'un élément:", itemError);
          errorCount++;
        }
      }
    }
    
    console.log(`Synchronisation terminée: ${syncCount} éléments synchronisés, ${errorCount} erreurs`);
    
    if (syncCount > 0) {
      toast({
        title: "Synchronisation réussie",
        description: `${syncCount} ressource(s) synchronisée(s) depuis le mode hors ligne`,
        variant: "default"
      });
    }
    
    return { success: true, syncCount, errorCount };
  } catch (error) {
    console.error("Erreur lors de la synchronisation des données hors ligne:", error);
    return { success: false, reason: "sync_error", error };
  }
}

/**
 * Active la synchronisation automatique lors de la reconnexion
 */
export function setupAutoSync() {
  // Synchroniser lorsque la connexion est rétablie
  window.addEventListener('online', () => {
    console.log("Connexion rétablie, tentative de synchronisation automatique");
    setTimeout(() => synchronizeOfflineData(), 2000);
  });
  
  // Vérifier périodiquement si nous pouvons synchroniser
  setInterval(() => {
    if (window.navigator.onLine) {
      synchronizeOfflineData();
    }
  }, 5 * 60 * 1000); // Toutes les 5 minutes
}
