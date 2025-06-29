
import React, { ReactNode, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Save, CheckCircle, AlertCircle, Wifi, WifiOff, Clock } from "lucide-react";
import { useSimpleResourceData } from "@/hooks/resource/useSimpleResourceData";

interface SimpleResourceFormProps {
  children: ReactNode | ((props: { formData: any; handleFormChange: (field: string, value: any) => void }) => ReactNode);
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  defaultValues?: any;
  onDataSaved?: (data: any) => void;
  exportPanel?: ReactNode;
}

export default function SimpleResourceForm({
  children,
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  defaultValues = {},
  onDataSaved,
  exportPanel
}: SimpleResourceFormProps) {
  const {
    formData,
    isLoading,
    isSaving,
    isAuthenticated,
    lastSaveStatus,
    handleFormChange,
    handleManualSave
  } = useSimpleResourceData({
    stepId,
    substepTitle,
    resourceType,
    defaultValues,
    onDataSaved: (data) => {
      console.log('Données sauvegardées via SimpleResourceForm:', data);
      if (onDataSaved) {
        onDataSaved(data);
      }
    }
  });

  // Wrapper pour gérer les changements de champs avec débogage
  const handleFieldChange = useCallback((field: string, value: any) => {
    console.log(`SimpleResourceForm: Changement détecté pour ${field}:`, value);
    handleFormChange(field, value);
  }, [handleFormChange]);

  const getSaveButtonText = () => {
    if (isSaving) return "Sauvegarde...";
    if (lastSaveStatus === 'success') return "Sauvegardé";
    if (lastSaveStatus === 'error') return "Réessayer";
    if (lastSaveStatus === 'pending') return "En cours...";
    return "Sauvegarder";
  };

  const getSaveButtonIcon = () => {
    if (isSaving) return <LoadingIndicator size="sm" />;
    if (lastSaveStatus === 'success') return <CheckCircle className="h-4 w-4" />;
    if (lastSaveStatus === 'error') return <AlertCircle className="h-4 w-4" />;
    if (lastSaveStatus === 'pending') return <Clock className="h-4 w-4" />;
    return <Save className="h-4 w-4" />;
  };

  const getSaveButtonVariant = () => {
    if (lastSaveStatus === 'success') return 'default';
    if (lastSaveStatus === 'error') return 'destructive';
    if (lastSaveStatus === 'pending') return 'secondary';
    return 'default';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center py-12">
          <LoadingIndicator size="md" />
          <span className="ml-2 text-muted-foreground">Chargement...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center text-green-600 text-sm">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Connecté</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 text-sm">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Hors ligne</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Statut de sauvegarde amélioré */}
        {lastSaveStatus === 'success' && (
          <Alert variant="default" className="mt-4 border-green-500/20 bg-green-50/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Données sauvegardées avec succès
              {!isAuthenticated && " localement"}
            </AlertDescription>
          </Alert>
        )}
        
        {lastSaveStatus === 'pending' && (
          <Alert variant="default" className="mt-4 border-blue-500/20 bg-blue-50/10">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Sauvegarde en cours...
            </AlertDescription>
          </Alert>
        )}
        
        {lastSaveStatus === 'error' && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors de la sauvegarde. Vos données sont conservées localement.
              {isAuthenticated && " Cliquez sur 'Réessayer' pour sauvegarder en ligne."}
            </AlertDescription>
          </Alert>
        )}
        
        {!isAuthenticated && (
          <Alert variant="default" className="mt-4 border-amber-500/20 bg-amber-50/10">
            <WifiOff className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              Mode hors ligne - Vos données sont sauvegardées localement et seront synchronisées lors de votre connexion.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          {typeof children === 'function' 
            ? children({ formData, handleFormChange: handleFieldChange })
            : React.cloneElement(children as React.ReactElement, { 
                formData, 
                handleFormChange: handleFieldChange 
              })
          }
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={handleManualSave}
            disabled={isSaving}
            variant={getSaveButtonVariant()}
            className="flex items-center gap-2"
          >
            {getSaveButtonIcon()}
            {getSaveButtonText()}
          </Button>
          
          {exportPanel && (
            <div className="ml-4">{exportPanel}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
