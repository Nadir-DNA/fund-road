
// Utility functions to format different resource types for export

export interface FormattedExport {
  title: string;
  date: string;
  sections: Array<{ name: string; content: string }>;
}

export const formatBusinessModelCanvas = (data: any): FormattedExport => {
  return {
    title: `Business Model Canvas - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      { name: "Partenaires clés", content: data.key_partners || "" },
      { name: "Activités clés", content: data.key_activities || "" },
      { name: "Ressources clés", content: data.key_resources || "" },
      { name: "Proposition de valeur", content: data.value_propositions || "" },
      { name: "Relations clients", content: data.customer_relationships || "" },
      { name: "Canaux de distribution", content: data.channels || "" },
      { name: "Segments clients", content: data.customer_segments || "" },
      { name: "Structure de coûts", content: data.cost_structure || "" },
      { name: "Sources de revenus", content: data.revenue_streams || "" }
    ]
  };
};

export const formatSWOTAnalysis = (data: any): FormattedExport => {
  return {
    title: `Analyse SWOT - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      { name: "Forces", content: data.strengths || "" },
      { name: "Faiblesses", content: data.weaknesses || "" },
      { name: "Opportunités", content: data.opportunities || "" },
      { name: "Menaces", content: data.threats || "" },
      { name: "Stratégie S-O", content: data.strategy_so || "" },
      { name: "Stratégie S-T", content: data.strategy_st || "" },
      { name: "Stratégie W-O", content: data.strategy_wo || "" },
      { name: "Stratégie W-T", content: data.strategy_wt || "" }
    ]
  };
};

export const formatEmpathyMap = (data: any): FormattedExport => {
  return {
    title: `Matrice d'Empathie - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      { name: "Utilisateur", content: `${data.persona_name || ""}${data.persona_role ? ` - ${data.persona_role}` : ""}${data.persona_age ? ` (${data.persona_age} ans)` : ""}` },
      { name: "Ce qu'il pense et dit", content: data.thinks_says || "" },
      { name: "Ce qu'il ressent", content: data.feels || "" },
      { name: "Ce qu'il entend", content: data.hears || "" },
      { name: "Ce qu'il voit", content: data.sees || "" },
      { name: "Ce qu'il fait", content: data.does || "" },
      { name: "Points douloureux", content: data.pains || "" },
      { name: "Gains potentiels", content: data.gains || "" },
      { name: "Objectifs", content: data.goals || "" }
    ]
  };
};

export const formatProblemSolutionMatrix = (data: any): FormattedExport => {
  return {
    title: `Matrice Problème-Solution - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      { name: "Proposition de valeur", content: data.value_proposition || "" },
      { name: "Segment cible", content: data.target_users || "" },
      { name: "Problème 1", content: data.problem1 || "" },
      { name: "Solution 1", content: data.problem1_solution || "" },
      { name: "Validation 1", content: data.problem1_validation || "" },
      { name: "Problème 2", content: data.problem2 || "" },
      { name: "Solution 2", content: data.problem2_solution || "" },
      { name: "Validation 2", content: data.problem2_validation || "" },
      { name: "Problème 3", content: data.problem3 || "" },
      { name: "Solution 3", content: data.problem3_solution || "" },
      { name: "Validation 3", content: data.problem3_validation || "" }
    ]
  };
};

export const formatMVPSelector = (data: any): FormattedExport => {
  if (!data.features) return { title: `MVP Selector - ${data.projectName || 'Mon Projet'}`, date: data.exportDate, sections: [] };
  
  const mvpFeatures = data.features.filter((f: any) => f.inMvp);
  const futureFeatures = data.features.filter((f: any) => !f.inMvp);
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'must': return 'Must have';
      case 'should': return 'Should have';
      case 'could': return 'Could have';
      case 'wont': return 'Won\'t have';
      default: return '';
    }
  };
  
  return {
    title: `Sélecteur de MVP - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      { 
        name: "Fonctionnalités MVP", 
        content: mvpFeatures.map((f: any) => 
          `${f.name} (${getPriorityLabel(f.priority)}) - Impact: ${f.impact}, Complexité: ${f.complexity}\n${f.description}`
        ).join('\n\n') 
      },
      { 
        name: "Fonctionnalités futures", 
        content: futureFeatures.map((f: any) => 
          `${f.name} (${getPriorityLabel(f.priority)}) - Impact: ${f.impact}, Complexité: ${f.complexity}\n${f.description}`
        ).join('\n\n') 
      }
    ]
  };
};

export const formatCapTable = (data: any): FormattedExport => {
  if (!data.shareholders) return { title: `Cap Table - ${data.projectName || 'Mon Projet'}`, date: data.exportDate, sections: [] };
  
  return {
    title: `Table de Capitalisation - ${data.projectName}`,
    date: data.exportDate,
    sections: [
      {
        name: "Actionnaires",
        content: data.shareholders.map((s: any) => 
          `${s.name}: ${s.shares} actions (${s.percentage}%)`
        ).join('\n')
      },
      {
        name: "Investissements",
        content: data.investmentHistory ? data.investmentHistory.map((inv: any) => 
          `${inv.investor}: ${inv.amount} € (${inv.shares} actions)`
        ).join('\n') : "Aucun investissement"
      }
    ]
  };
};

// Centralizing the formatter selection
export const formatDataForExport = (data: any, format: "pdf" | "docx" | "xlsx", projectName: string, resourceType: string): FormattedExport => {
  // Add common metadata
  const exportData = {
    ...data,
    projectName,
    exportDate: new Date().toLocaleDateString('fr-FR'),
  };

  // Format according to resource type
  switch (resourceType) {
    case "business_model_canvas":
      return formatBusinessModelCanvas(exportData);
    case "swot_analysis":
      return formatSWOTAnalysis(exportData);
    case "empathy_map":
      return formatEmpathyMap(exportData);
    case "problem_solution_matrix":
      return formatProblemSolutionMatrix(exportData);
    case "mvp_selector":
      return formatMVPSelector(exportData);
    case "cap_table":
      return formatCapTable(exportData);
    default:
      return {
        title: `${resourceType} - ${projectName}`,
        date: exportData.exportDate,
        sections: []
      };
  }
};
