
/**
 * Utility to normalize substep titles consistently across the application
 * This solves the issue of different formats of substep titles
 */
export function normalizeSubstepTitle(stepId: number, title: string): string {
  if (!title) return '';
  
  console.log(`Normalizing title for step ${stepId}: "${title}"`);
  
  // Clean the title first (remove any leading underscores)
  const cleanedTitle = title.startsWith('_') ? title.substring(1) : title;
  
  // For Step 1 (Recherche)
  if (stepId === 1) {
    if (title.includes('_user_research') || 
        title.includes('Recherche utilisateur') || 
        title.toLowerCase().includes('recherche')) {
      console.log(`Step 1: Normalizing "${title}" to "Recherche utilisateur"`);
      return "Recherche utilisateur";
    }
    
    if (title.includes('opportunité') || 
        title.includes('_competitive') || 
        title.toLowerCase().includes('opportunite')) {
      console.log(`Step 1: Normalizing "${title}" to "Définition de l'opportunité"`);
      return "Définition de l'opportunité";
    }
  }
  
  // For Step 2 (Conception)
  if (stepId === 2) {
    // Map potential variations to canonical titles
    if (title === '_persona' || 
        title === '_problemSolution' || 
        title === '_empathy' || 
        title.includes('proposition') || 
        title.includes('valeur')) {
      console.log(`Step 2: Normalizing "${title}" to "Proposition de valeur"`);
      return 'Proposition de valeur';
    } 
    else if (title === '_mvp' || 
             title === '_productStrategy' || 
             title === '_roadmap' || 
             title.includes('stratégie') || 
             title.includes('produit')) {
      console.log(`Step 2: Normalizing "${title}" to "Stratégie produit"`);
      return 'Stratégie produit';
    }
    else if (title.includes('_user_research') || 
             title.includes('utilisateur') ||
             title.toLowerCase().includes('recherche')) {
      console.log(`Step 2: Normalizing "${title}" to "Recherche utilisateur"`);
      return 'Recherche utilisateur';
    }
    else if (title.includes('_competitive') || 
             title.includes('concurrentielle') ||
             title.toLowerCase().includes('concurr')) {
      console.log(`Step 2: Normalizing "${title}" to "Analyse concurrentielle"`);
      return 'Analyse concurrentielle';
    }
  }
  
  // For Step 3 (Développement)
  if (stepId === 3) {
    if (title.includes('_user_research') || 
        title.includes('utilisateur') ||
        title.toLowerCase().includes('test')) {
      console.log(`Step 3: Normalizing "${title}" to "Tests utilisateurs"`);
      return 'Tests utilisateurs';
    }
  }
  
  // If no specific normalization rule matched
  console.log(`No specific normalization applied, cleaned: "${cleanedTitle}"`);
  return cleanedTitle;
}
