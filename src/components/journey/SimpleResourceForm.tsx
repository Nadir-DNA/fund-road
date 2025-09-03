
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useResourceData } from "@/hooks/useResourceData";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useInputProgressTracker } from "@/hooks/useInputProgressTracker";
import { useResourceCompletion } from "@/hooks/useResourceCompletion";
import ProgressIndicator from "./ProgressIndicator";
import EnhancedExportPanel from "./resource-form/EnhancedExportPanel";

interface SimpleResourceFormProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description?: string;
  defaultValues: any;
  children: (props: {
    formData: any;
    handleFormChange: (field: string, value: any) => void;
  }) => ReactNode;
  exportPanel?: ReactNode;
}

export default function SimpleResourceForm({
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  defaultValues,
  children,
  exportPanel
}: SimpleResourceFormProps) {
  const {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleManualSave,
    session,
    lastSaveStatus
  } = useResourceData(stepId, substepTitle, resourceType, defaultValues);

  // Track input progress
  const { progressData, isUpdating } = useInputProgressTracker(
    stepId,
    substepTitle,
    resourceType,
    formData
  );

  // Track completion and trigger downloads
  const { isCompleted } = useResourceCompletion({
    stepId,
    substepTitle,
    resourceType,
    formData,
    onDownload: () => {
      // This will be called when the resource is completed
      // The download buttons will be in the export panel
    }
  });

  const handleSave = async () => {
    if (session) {
      await handleManualSave(session);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          {description && (
            <p className="text-slate-300 text-sm">{description}</p>
          )}
        </div>
        
        {/* Progress indicator */}
        {progressData.totalInputs > 0 && (
          <ProgressIndicator
            totalInputs={progressData.totalInputs}
            filledInputs={progressData.filledInputs}
            progressPercentage={progressData.progressPercentage}
            isUpdating={isUpdating}
            title="Progression de cette ressource"
          />
        )}
      </div>

      {/* Form content */}
      <Card className="border-slate-600 bg-slate-800/50">
        <CardHeader className="border-b border-slate-600">
          <CardTitle className="text-lg text-white flex items-center justify-between">
            <span>Contenu du formulaire</span>
            <ProgressIndicator
              totalInputs={progressData.totalInputs}
              filledInputs={progressData.filledInputs}
              progressPercentage={progressData.progressPercentage}
              isUpdating={isUpdating}
              compact={true}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {children({ formData, handleFormChange })}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {/* Export panel or default enhanced export */}
        {exportPanel || (
          <EnhancedExportPanel 
            formData={formData}
            resourceType={resourceType}
            title={title}
          />
        )}
      </div>

      {/* Save status indicator */}
      {lastSaveStatus && (
        <div className="text-xs text-center">
          {lastSaveStatus === 'success' && (
            <span className="text-green-400">✓ Sauvegardé automatiquement</span>
          )}
          {lastSaveStatus === 'error' && (
            <span className="text-red-400">✗ Erreur de sauvegarde</span>
          )}
          {lastSaveStatus === 'pending' && (
            <span className="text-yellow-400">⌛ Sauvegarde en cours...</span>
          )}
        </div>
      )}
    </div>
  );
}
