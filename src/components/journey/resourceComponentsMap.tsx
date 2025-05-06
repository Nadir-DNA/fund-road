
import { lazy } from "react";

// Define the props interface that all resource components should have
export interface ResourceComponentProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
}

// Using React.lazy for dynamic imports with proper typing
export const resourceComponentsMap: Record<string, React.LazyExoticComponent<React.ComponentType<ResourceComponentProps>>> = {
  // User research and ideation
  "UserResearchNotebook": lazy(() => import("./resources/UserResearchNotebook")),
  "CustomerBehaviorNotes": lazy(() => import("./resources/CustomerBehaviorNotes")),
  "PersonaBuilder": lazy(() => import("./resources/PersonaBuilder")),
  "EmpathyMap": lazy(() => import("./resources/EmpathyMap")),
  "OpportunityDefinition": lazy(() => import("./resources/OpportunityDefinition")),
  
  // Business analysis
  "ProblemSolutionMatrix": lazy(() => import("./resources/ProblemSolutionMatrix")),
  "ProblemSolutionCanvas": lazy(() => import("./resources/ProblemSolutionCanvas")),
  "SwotAnalysis": lazy(() => import("./resources/SwotAnalysis")),
  "BusinessModelCanvas": lazy(() => import("./resources/BusinessModelCanvas")),
  "CompetitiveAnalysisTable": lazy(() => import("./resources/CompetitiveAnalysisTable")),
  "MarketAnalysisGrid": lazy(() => import("./resources/MarketAnalysisGrid")),
  "MarketSizeEstimator": lazy(() => import("./resources/MarketSizeEstimator")),
  
  // MVP and Product Development
  "MVPSelector": lazy(() => import("./resources/MVPSelector")),
  "MvpSpecification": lazy(() => import("./resources/MvpSpecification")),
  "FeaturePrioritizationMatrix": lazy(() => import("./resources/FeaturePrioritizationMatrix")),
  "ProductRoadmapEditor": lazy(() => import("./resources/ProductRoadmapEditor")),
  "UserFeedbackForm": lazy(() => import("./resources/UserFeedbackForm")),
  "ExperimentSummary": lazy(() => import("./resources/ExperimentSummary")),
  
  // Business Planning
  "BusinessPlanIntent": lazy(() => import("./resources/BusinessPlanIntent")),
  "BusinessPlanEditor": lazy(() => import("./resources/BusinessPlanEditor")),
  "FinancialTables": lazy(() => import("./resources/FinancialTables")),
  "MonetizationTestGrid": lazy(() => import("./resources/MonetizationTestGrid")),
  "PaidOfferFeedback": lazy(() => import("./resources/PaidOfferFeedback")),
  "GrowthProjection": lazy(() => import("./resources/GrowthProjection")),
  "DilutionSimulator": lazy(() => import("./resources/DilutionSimulator")),
  
  // Legal and Team
  "LegalStatusSelector": lazy(() => import("./resources/LegalStatusSelector")),
  "LegalStatusComparison": lazy(() => import("./resources/LegalStatusComparison")),
  "CofounderProfile": lazy(() => import("./resources/CofounderProfile")),
  "CofounderAlignment": lazy(() => import("./resources/CofounderAlignment")),
  "RecruitmentPlan": lazy(() => import("./resources/RecruitmentPlan")),
  "CapTableEditor": lazy(() => import("./resources/CapTableEditor")),
  
  // IP and funding
  "IPSelfAssessment": lazy(() => import("./resources/IPSelfAssessment")),
  "IPProceduresChecklist": lazy(() => import("./resources/IPProceduresChecklist")),
  "FundingMap": lazy(() => import("./resources/FundingMap")),
  "TermSheetBuilder": lazy(() => import("./resources/TermSheetBuilder")),
  "PitchStoryTeller": lazy(() => import("./resources/PitchStoryTeller")),
  "InvestorEmailScript": lazy(() => import("./resources/InvestorEmailScript")),
  "InvestorObjectionPrep": lazy(() => import("./resources/InvestorObjectionPrep")),
  "InvestorFollowUpPlan": lazy(() => import("./resources/InvestorFollowUpPlan")),
  "StartupToolPicker": lazy(() => import("./resources/StartupToolPicker"))
};
