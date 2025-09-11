
/**
 * Utility for mapping resource types to component names
 */

// Mapping utility function for converting resource types to component names
export const mapResourceTypeToComponent = (resourceType: string) => {
  // This mapping converts the database resource_type to the proper component name
  const mappings: Record<string, string> = {
    'user_research_notebook': 'UserResearchNotebook',
    'customer_behavior_notes': 'CustomerBehaviorNotes',
    'persona_builder': 'PersonaBuilder',
    'empathy_map': 'EmpathyMap',
    'opportunity_definition': 'OpportunityDefinition',
    'swot_analysis': 'SwotAnalysis',
    'business_model_canvas': 'BusinessModelCanvas',
    'problem_solution_canvas': 'ProblemSolutionCanvas',
    'problem_solution_matrix': 'ProblemSolutionMatrix',
    'competitive_analysis_table': 'CompetitiveAnalysisTable',
    'market_analysis_grid': 'MarketAnalysisGrid',
    'market_size_estimator': 'MarketSizeEstimator',
    'mvp_selector': 'MVPSelector',
    'mvp_specification': 'MvpSpecification',
    'feature_prioritization_matrix': 'FeaturePrioritizationMatrix',
    'product_roadmap_editor': 'ProductRoadmapEditor',
    'user_feedback_form': 'UserFeedbackForm',
    'experiment_summary': 'ExperimentSummary',
    'business_plan_intent': 'BusinessPlanIntent',
    'business_plan_editor': 'BusinessPlanEditor',
    'financial_tables': 'FinancialTables',
    'monetization_test_grid': 'MonetizationTestGrid',
    'growth_projection': 'GrowthProjection',
    'dilution_simulator': 'DilutionSimulator',
    'legal_status_selector': 'LegalStatusSelector',
    'legal_status_comparison': 'LegalStatusComparison',
    'cofounder_profile': 'CofounderProfile',
    'cofounder_alignment': 'CofounderAlignment',
    'recruitment_plan': 'RecruitmentPlan',
    'cap_table_editor': 'CapTableEditor',
    'ip_self_assessment': 'IPSelfAssessment',
    'ip_procedures_checklist': 'IPProceduresChecklist',
    'funding_map': 'FundingMap',
    'term_sheet_builder': 'TermSheetBuilder',
    'pitch_storyteller': 'PitchStoryTeller',
    'investor_email_script': 'InvestorEmailScript',
    'investor_objection_prep': 'InvestorObjectionPrep',
    'investor_followup_plan': 'InvestorFollowUpPlan',
    'startup_tool_picker': 'StartupToolPicker'
  };
  
  return mappings[resourceType] || resourceType;
};
