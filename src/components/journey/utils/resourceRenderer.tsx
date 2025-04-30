
import React from "react";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

// Importer les composants de ressources dynamiquement
const BusinessModelCanvas = React.lazy(() => import("../resources/BusinessModelCanvas"));
const BusinessPlanEditor = React.lazy(() => import("../resources/BusinessPlanEditor"));
const BusinessPlanIntent = React.lazy(() => import("../resources/BusinessPlanIntent"));
const CapTableEditor = React.lazy(() => import("../resources/CapTableEditor"));
const CofounderAlignment = React.lazy(() => import("../resources/CofounderAlignment"));
const CofounderProfile = React.lazy(() => import("../resources/CofounderProfile"));
const CompetitiveAnalysisTable = React.lazy(() => import("../resources/CompetitiveAnalysisTable"));
const CustomerBehaviorNotes = React.lazy(() => import("../resources/CustomerBehaviorNotes"));
const DilutionSimulator = React.lazy(() => import("../resources/DilutionSimulator"));
const EmpathyMap = React.lazy(() => import("../resources/EmpathyMap"));
const ExperimentSummary = React.lazy(() => import("../resources/ExperimentSummary"));
const FeaturePrioritizationMatrix = React.lazy(() => import("../resources/FeaturePrioritizationMatrix"));
const FinancialTables = React.lazy(() => import("../resources/FinancialTables"));
const FundingMap = React.lazy(() => import("../resources/FundingMap"));
const GrowthProjection = React.lazy(() => import("../resources/GrowthProjection"));
const IPProceduresChecklist = React.lazy(() => import("../resources/IPProceduresChecklist"));
const IPSelfAssessment = React.lazy(() => import("../resources/IPSelfAssessment"));
const IPStrategyCanvas = React.lazy(() => import("../resources/IPStrategyCanvas"));
const InvestorEmailScript = React.lazy(() => import("../resources/InvestorEmailScript"));
const InvestorFollowUpPlan = React.lazy(() => import("../resources/InvestorFollowUpPlan"));
const InvestorObjectionPrep = React.lazy(() => import("../resources/InvestorObjectionPrep"));
const LegalStatusComparison = React.lazy(() => import("../resources/LegalStatusComparison"));
const LegalStatusSelector = React.lazy(() => import("../resources/LegalStatusSelector"));
const MVPSelector = React.lazy(() => import("../resources/MVPSelector"));
const MarketAnalysisGrid = React.lazy(() => import("../resources/MarketAnalysisGrid"));
const MentorTrackingSheet = React.lazy(() => import("../resources/MentorTrackingSheet"));
const MonetizationTestGrid = React.lazy(() => import("../resources/MonetizationTestGrid"));
const MvpSpecification = React.lazy(() => import("../resources/MvpSpecification"));
const PitchStoryTeller = React.lazy(() => import("../resources/PitchStoryTeller"));
const ProblemSolutionCanvas = React.lazy(() => import("../resources/ProblemSolutionCanvas"));
const StartupToolPicker = React.lazy(() => import("../resources/StartupToolPicker"));
const SwotAnalysis = React.lazy(() => import("../resources/SwotAnalysis"));
const TermSheetBuilder = React.lazy(() => import("../resources/TermSheetBuilder"));
const UserFeedbackForm = React.lazy(() => import("../resources/UserFeedbackForm"));
const UserResearchNotebook = React.lazy(() => import("../resources/UserResearchNotebook"));

export const renderResourceComponent = (componentName: string, stepId: number, substepTitle: string, subsubstepTitle?: string | null) => {
  if (!componentName) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Sélectionnez une ressource pour commencer
      </div>
    );
  }

  const resourceProps = {
    stepId,
    substepTitle,
    subsubstepTitle
  };

  const resourceComponents: Record<string, React.ReactNode> = {
    business_model_canvas: <BusinessModelCanvas {...resourceProps} />,
    business_plan_editor: <BusinessPlanEditor {...resourceProps} />,
    business_plan_intent: <BusinessPlanIntent {...resourceProps} />,
    cap_table_editor: <CapTableEditor {...resourceProps} />,
    cofounder_alignment: <CofounderAlignment {...resourceProps} />,
    cofounder_profile: <CofounderProfile {...resourceProps} />,
    competitive_analysis_table: <CompetitiveAnalysisTable {...resourceProps} />,
    customer_behavior_notes: <CustomerBehaviorNotes {...resourceProps} />,
    dilution_simulator: <DilutionSimulator {...resourceProps} />,
    empathy_map: <EmpathyMap {...resourceProps} />,
    experiment_summary: <ExperimentSummary {...resourceProps} />,
    feature_prioritization_matrix: <FeaturePrioritizationMatrix {...resourceProps} />,
    financial_tables: <FinancialTables {...resourceProps} />,
    funding_map: <FundingMap {...resourceProps} />,
    growth_projection: <GrowthProjection {...resourceProps} />,
    ip_procedures_checklist: <IPProceduresChecklist {...resourceProps} />,
    ip_self_assessment: <IPSelfAssessment {...resourceProps} />,
    ip_strategy_canvas: <IPStrategyCanvas {...resourceProps} />,
    investor_email_script: <InvestorEmailScript {...resourceProps} />,
    investor_followup_plan: <InvestorFollowUpPlan {...resourceProps} />,
    investor_objection_prep: <InvestorObjectionPrep {...resourceProps} />,
    legal_status_comparison: <LegalStatusComparison {...resourceProps} />,
    legal_status_selector: <LegalStatusSelector {...resourceProps} />,
    market_analysis_grid: <MarketAnalysisGrid {...resourceProps} />,
    mentor_tracking_sheet: <MentorTrackingSheet {...resourceProps} />,
    monetization_test_grid: <MonetizationTestGrid {...resourceProps} />,
    mvp_selector: <MVPSelector {...resourceProps} />,
    mvp_specification: <MvpSpecification {...resourceProps} />,
    pitch_storyteller: <PitchStoryTeller {...resourceProps} />,
    problem_solution_canvas: <ProblemSolutionCanvas {...resourceProps} />,
    startup_tool_picker: <StartupToolPicker {...resourceProps} />,
    swot_analysis: <SwotAnalysis {...resourceProps} />,
    term_sheet_builder: <TermSheetBuilder {...resourceProps} />,
    user_feedback_form: <UserFeedbackForm {...resourceProps} />,
    user_research_notebook: <UserResearchNotebook {...resourceProps} />,
  };

  const Component = resourceComponents[componentName];
  
  if (!Component) {
    console.error(`Composant de ressource non trouvé: ${componentName}`);
    return (
      <div className="text-center p-4 text-muted-foreground">
        Ressource non disponible
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><LoadingIndicator size="lg" /></div>}>
      {Component}
    </Suspense>
  );
};
