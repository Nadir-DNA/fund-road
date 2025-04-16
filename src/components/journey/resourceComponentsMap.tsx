
import { lazy } from "react";

// Using React.lazy for dynamic imports
export const resourceComponentsMap: Record<string, React.LazyExoticComponent<any>> = {
  // User research and ideation
  "UserResearchNotebook.tsx": lazy(() => import("./resources/UserResearchNotebook")),
  "CustomerBehaviorNotes.tsx": lazy(() => import("./resources/CustomerBehaviorNotes")),
  "PersonaBuilder.tsx": lazy(() => import("./resources/PersonaBuilder")),
  "EmpathyMap.tsx": lazy(() => import("./resources/EmpathyMap")),
  "OpportunityDefinition.tsx": lazy(() => import("./resources/OpportunityDefinition")),
  
  // Business analysis
  "ProblemSolutionMatrix.tsx": lazy(() => import("./resources/ProblemSolutionMatrix")),
  "ProblemSolutionCanvas.tsx": lazy(() => import("./resources/ProblemSolutionCanvas")),
  "SwotAnalysis.tsx": lazy(() => import("./resources/SwotAnalysis")),
  "BusinessModelCanvas.tsx": lazy(() => import("./resources/BusinessModelCanvas")),
  "CompetitiveAnalysisTable.tsx": lazy(() => import("./resources/CompetitiveAnalysisTable")),
  "MarketAnalysisGrid.tsx": lazy(() => import("./resources/MarketAnalysisGrid")),
  "MarketSizeEstimator.tsx": lazy(() => import("./resources/MarketSizeEstimator")),
  
  // MVP and Product Development
  "MVPSelector.tsx": lazy(() => import("./resources/MVPSelector")),
  "MvpSpecification.tsx": lazy(() => import("./resources/MvpSpecification")),
  "FeaturePrioritizationMatrix.tsx": lazy(() => import("./resources/FeaturePrioritizationMatrix")),
  "ProductRoadmapEditor.tsx": lazy(() => import("./resources/ProductRoadmapEditor")),
  "UserFeedbackForm.tsx": lazy(() => import("./resources/UserFeedbackForm")),
  "ExperimentSummary.tsx": lazy(() => import("./resources/ExperimentSummary")),
  
  // Business Planning
  "BusinessPlanIntent.tsx": lazy(() => import("./resources/BusinessPlanIntent")),
  "BusinessPlanEditor.tsx": lazy(() => import("./resources/BusinessPlanEditor")),
  "FinancialTables.tsx": lazy(() => import("./resources/FinancialTables")),
  "MonetizationTestGrid.tsx": lazy(() => import("./resources/MonetizationTestGrid")),
  "PaidOfferFeedback.tsx": lazy(() => import("./resources/PaidOfferFeedback")),
  
  // Legal and Team
  "LegalStatusSelector.tsx": lazy(() => import("./resources/LegalStatusSelector")),
  "LegalStatusComparison.tsx": lazy(() => import("./resources/LegalStatusComparison")),
  "CofounderProfile.tsx": lazy(() => import("./resources/CofounderProfile")),
  "CofounderAlignment.tsx": lazy(() => import("./resources/CofounderAlignment")),
  "RecruitmentPlan.tsx": lazy(() => import("./resources/RecruitmentPlan")),
  "CapTable.tsx": lazy(() => import("./resources/CapTable")),
};
