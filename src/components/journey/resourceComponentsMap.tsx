import { lazy } from "react";

// Define the props interface that all resource components should have
export interface ResourceComponentProps {
  stepId: number;
  substepTitle: string;
  subsubstepTitle?: string | null;
  resourceType?: string;
}

// Enhanced lazy loading with error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(async () => {
    try {
      console.log(`Loading component: ${componentName}`);
      const module = await importFn();
      console.log(`Successfully loaded component: ${componentName}`);
      return module;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      // Return a fallback component that matches the expected interface
      return {
        default: ({ stepId, substepTitle }: ResourceComponentProps) => (
          <div className="p-4 border border-amber-500/20 bg-amber-500/10 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Composant temporairement indisponible</h3>
            <p className="text-sm text-muted-foreground">
              Le composant <strong>{componentName}</strong> ne peut pas être chargé pour le moment.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Étape: {stepId}, Section: {substepTitle}
            </p>
          </div>
        )
      };
    }
  });
};

// Using React.lazy with enhanced error handling
export const resourceComponentsMap: Record<string, React.LazyExoticComponent<React.ComponentType<ResourceComponentProps>>> = {
  // User research and ideation
  "UserResearchNotebook": createLazyComponent(() => import("./resources/UserResearchNotebook"), "UserResearchNotebook"),
  "CustomerBehaviorNotes": createLazyComponent(() => import("./resources/CustomerBehaviorNotes"), "CustomerBehaviorNotes"),
  "PersonaBuilder": createLazyComponent(() => import("./resources/PersonaBuilder"), "PersonaBuilder"),
  "EmpathyMap": createLazyComponent(() => import("./resources/EmpathyMap"), "EmpathyMap"),
  "OpportunityDefinition": createLazyComponent(() => import("./resources/OpportunityDefinition"), "OpportunityDefinition"),
  
  // Business analysis
  "ProblemSolutionMatrix": createLazyComponent(() => import("./resources/ProblemSolutionMatrix"), "ProblemSolutionMatrix"),
  "ProblemSolutionCanvas": createLazyComponent(() => import("./resources/ProblemSolutionCanvas"), "ProblemSolutionCanvas"),
  "SwotAnalysis": createLazyComponent(() => import("./resources/SwotAnalysis"), "SwotAnalysis"),
  "BusinessModelCanvas": createLazyComponent(() => import("./resources/BusinessModelCanvas"), "BusinessModelCanvas"),
  "CompetitiveAnalysisTable": createLazyComponent(() => import("./resources/CompetitiveAnalysisTable"), "CompetitiveAnalysisTable"),
  "MarketAnalysisGrid": createLazyComponent(() => import("./resources/MarketAnalysisGrid"), "MarketAnalysisGrid"),
  "MarketSizeEstimator": createLazyComponent(() => import("./resources/MarketSizeEstimator"), "MarketSizeEstimator"),
  
  // MVP and Product Development
  "MVPSelector": createLazyComponent(() => import("./resources/MVPSelector"), "MVPSelector"),
  "MvpSpecification": createLazyComponent(() => import("./resources/MvpSpecification"), "MvpSpecification"),
  "FeaturePrioritizationMatrix": createLazyComponent(() => import("./resources/FeaturePrioritizationMatrix"), "FeaturePrioritizationMatrix"),
  "ProductRoadmapEditor": createLazyComponent(() => import("./resources/ProductRoadmapEditor"), "ProductRoadmapEditor"),
  "UserFeedbackForm": createLazyComponent(() => import("./resources/UserFeedbackForm"), "UserFeedbackForm"),
  "ExperimentSummary": createLazyComponent(() => import("./resources/ExperimentSummary"), "ExperimentSummary"),
  
  // Business Planning
  "BusinessPlanIntent": createLazyComponent(() => import("./resources/BusinessPlanIntent"), "BusinessPlanIntent"),
  "BusinessPlanEditor": createLazyComponent(() => import("./resources/BusinessPlanEditor"), "BusinessPlanEditor"),
  "FinancialTables": createLazyComponent(() => import("./resources/FinancialTables"), "FinancialTables"),
  "MonetizationTestGrid": createLazyComponent(() => import("./resources/MonetizationTestGrid"), "MonetizationTestGrid"),
  "PaidOfferFeedback": createLazyComponent(() => import("./resources/PaidOfferFeedback"), "PaidOfferFeedback"),
  "GrowthProjection": createLazyComponent(() => import("./resources/GrowthProjection"), "GrowthProjection"),
  "DilutionSimulator": createLazyComponent(() => import("./resources/DilutionSimulator"), "DilutionSimulator"),
  
  // Legal and Team
  "LegalStatusSelector": createLazyComponent(() => import("./resources/LegalStatusSelector"), "LegalStatusSelector"),
  "LegalStatusComparison": createLazyComponent(() => import("./resources/LegalStatusComparison"), "LegalStatusComparison"),
  "CofounderProfile": createLazyComponent(() => import("./resources/CofounderProfile"), "CofounderProfile"),
  "CofounderAlignment": createLazyComponent(() => import("./resources/CofounderAlignment"), "CofounderAlignment"),
  "RecruitmentPlan": createLazyComponent(() => import("./resources/RecruitmentPlan"), "RecruitmentPlan"),
  "CapTableEditor": createLazyComponent(() => import("./resources/CapTableEditor"), "CapTableEditor"),
  
  // IP and funding
  "IPSelfAssessment": createLazyComponent(() => import("./resources/IPSelfAssessment"), "IPSelfAssessment"),
  "IPProceduresChecklist": createLazyComponent(() => import("./resources/IPProceduresChecklist"), "IPProceduresChecklist"),
  "FundingMap": createLazyComponent(() => import("./resources/FundingMap"), "FundingMap"),
  "TermSheetBuilder": createLazyComponent(() => import("./resources/TermSheetBuilder"), "TermSheetBuilder"),
  "PitchStoryTeller": createLazyComponent(() => import("./resources/PitchStoryTeller"), "PitchStoryTeller"),
  "InvestorEmailScript": createLazyComponent(() => import("./resources/InvestorEmailScript"), "InvestorEmailScript"),
  "InvestorObjectionPrep": createLazyComponent(() => import("./resources/InvestorObjectionPrep"), "InvestorObjectionPrep"),
  "InvestorFollowUpPlan": createLazyComponent(() => import("./resources/InvestorFollowUpPlan"), "InvestorFollowUpPlan"),
  "StartupToolPicker": createLazyComponent(() => import("./resources/StartupToolPicker"), "StartupToolPicker"),
  
  // Course content display
  "CourseContentDisplay": createLazyComponent(() => import("./resources/CourseContentDisplay"), "CourseContentDisplay")
};
