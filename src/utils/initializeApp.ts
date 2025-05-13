
import { setupAutoSync } from "./offlineSync";

export function initializeApp() {
  // Active la synchronisation automatique des données hors ligne
  setupAutoSync();
  
  // Ajouter d'autres initialisations si nécessaire ici
  
  console.log("Initialisation de l'application terminée");
}
