
import { Step } from "@/types/journey";
import { ideationStep } from "./journeySteps/ideationStep";
import { conceptionStep } from "./journeySteps/conceptionStep";
import { businessModelStep } from "./journeySteps/businessModelStep";
import { strategyStep } from "./journeySteps/strategyStep";
import { strategicAnalysisStep } from "./journeySteps/strategicAnalysisStep";
import { businessPlanStep } from "./journeySteps/businessPlanStep";
import { legalStep } from "./journeySteps/legalStep";
import { operationsStep } from "./journeySteps/operationsStep";

export const journeySteps: Step[] = [
  ideationStep,
  conceptionStep,
  businessModelStep,
  strategyStep,
  strategicAnalysisStep,
  businessPlanStep,
  legalStep,
  operationsStep
];
