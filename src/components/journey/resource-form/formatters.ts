
export interface FormattedExport {
  title: string;
  date: string;
  sections?: FormattedSection[];
}

export interface FormattedSection {
  name: string;
  content: string;
}

// Function to format date for export
const formatDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Resource formatters for different resource types
const formatters: Record<string, (formData: any) => FormattedExport> = {
  // Format for SWOT analysis
  swot_analysis: (formData) => ({
    title: "Analyse SWOT",
    date: formatDate(),
    sections: [
      { name: "Forces", content: formData.strengths || "" },
      { name: "Faiblesses", content: formData.weaknesses || "" },
      { name: "Opportunités", content: formData.opportunities || "" },
      { name: "Menaces", content: formData.threats || "" },
      { name: "Conclusion", content: formData.conclusion || "" }
    ]
  }),
  
  // Format for market size estimator
  market_size_estimator: (formData) => ({
    title: "Estimation de la taille du marché",
    date: formatDate(),
    sections: [
      { name: "Marché total (TAM)", content: formData.tam || "" },
      { name: "Marché adressable (SAM)", content: formData.sam || "" },
      { name: "Marché serviceable (SOM)", content: formData.som || "" },
      { name: "Méthodologie", content: formData.methodology || "" }
    ]
  }),
  
  // Format for business model canvas
  business_model_canvas: (formData) => ({
    title: "Business Model Canvas",
    date: formatDate(),
    sections: [
      { name: "Segments clients", content: formData.customer_segments || "" },
      { name: "Proposition de valeur", content: formData.value_proposition || "" },
      { name: "Canaux de distribution", content: formData.channels || "" },
      { name: "Relations clients", content: formData.customer_relationships || "" },
      { name: "Sources de revenus", content: formData.revenue_streams || "" },
      { name: "Ressources clés", content: formData.key_resources || "" },
      { name: "Activités clés", content: formData.key_activities || "" },
      { name: "Partenaires clés", content: formData.key_partners || "" },
      { name: "Structure de coûts", content: formData.cost_structure || "" },
    ]
  }),
  
  // Format for opportunity definition
  opportunity_definition: (formData) => ({
    title: "Définition de l'opportunité",
    date: formatDate(),
    sections: [
      { name: "Problème identifié", content: formData.problem || "" },
      { name: "Solution proposée", content: formData.solution || "" },
      { name: "Marché cible", content: formData.target_market || "" },
      { name: "Analyse de la concurrence", content: formData.competition || "" },
      { name: "Avantage unique", content: formData.unique_advantage || "" }
    ]
  }),
  
  // Format for legal status comparison
  legal_status_comparison: (formData) => ({
    title: "Comparaison des statuts juridiques",
    date: formatDate(),
    sections: [
      { name: "SAS", content: formData.sas || "" },
      { name: "SARL", content: formData.sarl || "" },
      { name: "Micro-entreprise", content: formData.micro || "" },
      { name: "Conclusion", content: formData.conclusion || "" }
    ]
  }),
  
  // Format for IP self-assessment
  ip_self_assessment: (formData) => ({
    title: "Auto-diagnostic stratégique de la PI",
    date: formatDate(),
    sections: [
      { name: "Valeur stratégique", content: formData.strategic_value || "" },
      { name: "Type d'innovation", content: formData.innovation_type || "" },
      { name: "Avantage concurrentiel", content: formData.competitive_advantage || "" },
      { name: "Risque de copie", content: formData.risk_of_copy || "" },
      { name: "Impact sur la valorisation", content: formData.valorisation_impact || "" }
    ]
  }),
  
  // Format for investor objection prep
  investor_objection_prep: (formData) => ({
    title: "Préparation aux objections",
    date: formatDate(),
    sections: [
      { name: "Manque de traction", content: formData.traction_gap || "" },
      { name: "Question sur la valorisation", content: formData.valuation_question || "" },
      { name: "Doute sur l'équipe", content: formData.team_doubt || "" },
      { name: "Scalabilité du projet", content: formData.scalability_question || "" },
      { name: "Autres réponses préparées", content: formData.other_prepared_answers || "" }
    ]
  }),
  
  // Format for growth projection
  growth_projection: (formData) => ({
    title: "Projection de croissance",
    date: formatDate(),
    sections: [
      { name: "Jalons clés", content: formData.key_milestones || "" },
      { name: "Objectifs de croissance", content: formData.expected_growth || "" },
      { name: "Évolution de l'équipe", content: formData.team_scaling || "" },
      { name: "Évolution produit / tech", content: formData.product_scaling || "" }
    ]
  }),
  
  // Add more formatters for other resource types
};

// Default formatter for unknown resource types
const defaultFormatter = (formData: any): FormattedExport => {
  const title = "Exportation de données";
  const date = formatDate();
  const sections = Object.entries(formData).map(([key, value]) => {
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    return { name, content: String(value) };
  });
  
  return { title, date, sections };
};

// Main export function
export const formatResourceData = (formData: any, resourceType: string): FormattedExport => {
  const formatter = formatters[resourceType] || defaultFormatter;
  return formatter(formData);
};
