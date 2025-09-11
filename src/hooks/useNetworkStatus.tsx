
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(window.navigator.onLine);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  // Ping Supabase pour vérifier la connectivité
  const checkSupabaseConnection = async () => {
    try {
      // Nous utilisons une requête simple et rapide pour vérifier la connexion
      const start = Date.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const end = Date.now();
      
      // Si le temps de réponse est trop long (> 3s), on considère qu'il y a un problème
      const responseTime = end - start;
      const isConnected = !error && responseTime < 3000;
      
      setIsSupabaseConnected(isConnected);
      setLastCheckTime(new Date());
      
      return isConnected;
    } catch (e) {
      console.error("Erreur lors de la vérification de la connexion Supabase:", e);
      setIsSupabaseConnected(false);
      setLastCheckTime(new Date());
      return false;
    }
  };

  // Gérer les événements de changement de statut réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkSupabaseConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSupabaseConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la connectivité au montage
    checkSupabaseConnection();

    // Vérifier périodiquement la connectivité si nous sommes en ligne
    const intervalId = setInterval(() => {
      if (window.navigator.onLine) {
        checkSupabaseConnection();
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return {
    isOnline,
    isSupabaseConnected,
    lastCheckTime,
    checkSupabaseConnection
  };
}
