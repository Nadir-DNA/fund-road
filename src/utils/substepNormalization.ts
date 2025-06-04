
/**
 * Système de normalisation robuste pour les titres de sous-étapes
 * Gère tous les cas existants et futurs avec une stratégie de fallback
 */

interface NormalizationRule {
  stepId: number;
  patterns: string[];
  normalizedTitle: string;
}

// Règles de normalisation par étape
const NORMALIZATION_RULES: NormalizationRule[] = [
  {
    stepId: 1,
    patterns: [
      'recherche utilisateur',
      'user_research',
      '_user_research',
      'recherche',
      'user research'
    ],
    normalizedTitle: 'Recherche utilisateur'
  },
  {
    stepId: 1,
    patterns: [
      'définition de l\'opportunité',
      'definition de l\'opportunite',
      'opportunité',
      'opportunite',
      '_competitive',
      'competitive',
      'concurrentielle'
    ],
    normalizedTitle: 'Définition de l\'opportunité'
  },
  {
    stepId: 2,
    patterns: [
      'proposition de valeur',
      '_persona',
      '_problemSolution',
      '_empathy',
      'proposition',
      'valeur',
      'persona',
      'problem solution'
    ],
    normalizedTitle: 'Proposition de valeur'
  },
  {
    stepId: 2,
    patterns: [
      'stratégie produit',
      'strategie produit',
      '_mvp',
      '_productStrategy',
      '_roadmap',
      'stratégie',
      'strategie',
      'produit',
      'mvp',
      'roadmap'
    ],
    normalizedTitle: 'Stratégie produit'
  },
  {
    stepId: 2,
    patterns: [
      'analyse concurrentielle',
      '_competitive',
      'concurrentielle',
      'concurr',
      'competitive'
    ],
    normalizedTitle: 'Analyse concurrentielle'
  },
  {
    stepId: 3,
    patterns: [
      'tests utilisateurs',
      'test utilisateur',
      '_user_research',
      'utilisateur',
      'test',
      'tests'
    ],
    normalizedTitle: 'Tests utilisateurs'
  }
];

/**
 * Normalise un titre de sous-étape en utilisant les règles définies
 */
export function normalizeSubstepTitle(stepId: number, title: string): string {
  if (!title || typeof title !== 'string') {
    console.warn('normalizeSubstepTitle: titre invalide:', title);
    return '';
  }

  // Nettoyer le titre d'entrée
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/^_+/, '') // Supprimer les underscores en début
    .replace(/_+/g, ' ') // Remplacer les underscores par des espaces
    .replace(/\s+/g, ' '); // Normaliser les espaces

  console.log(`Normalisation - Étape ${stepId}: "${title}" -> "${cleanTitle}"`);

  // Chercher une règle correspondante
  for (const rule of NORMALIZATION_RULES) {
    if (rule.stepId === stepId) {
      for (const pattern of rule.patterns) {
        if (cleanTitle.includes(pattern.toLowerCase())) {
          console.log(`Normalisation trouvée: "${cleanTitle}" -> "${rule.normalizedTitle}"`);
          return rule.normalizedTitle;
        }
      }
    }
  }

  // Si aucune règle ne correspond, retourner le titre nettoyé
  const fallbackTitle = title.replace(/^_+/, '').replace(/_/g, ' ').trim();
  console.log(`Normalisation fallback: "${title}" -> "${fallbackTitle}"`);
  return fallbackTitle;
}

/**
 * Trouve tous les titres possibles pour une recherche flexible
 */
export function getPossibleTitles(stepId: number, title: string): string[] {
  const normalized = normalizeSubstepTitle(stepId, title);
  const variations = [normalized, title];

  // Ajouter des variations communes
  if (title !== normalized) {
    variations.push(title.replace(/^_+/, ''));
    variations.push(title.replace(/_/g, ' '));
  }

  // Supprimer les doublons
  return [...new Set(variations)].filter(Boolean);
}

/**
 * Vérifie si deux titres correspondent (même après normalisation)
 */
export function titlesMatch(stepId: number, title1: string, title2: string): boolean {
  if (!title1 || !title2) return false;
  
  const norm1 = normalizeSubstepTitle(stepId, title1);
  const norm2 = normalizeSubstepTitle(stepId, title2);
  
  return norm1 === norm2 || title1 === title2;
}
