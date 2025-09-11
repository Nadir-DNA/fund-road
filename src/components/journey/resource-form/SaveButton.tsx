
import React from 'react';
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Check, Save, SaveAll, WifiOff, AlertCircle, RefreshCcw } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  handleSave: () => void;
  isAuthenticated: boolean;
  isOfflineMode?: boolean;
  lastSaveStatus?: 'success' | 'error' | 'pending' | null;
  onRetryConnection?: () => void;
}

export default function SaveButton({ 
  isSaving, 
  handleSave, 
  isAuthenticated, 
  isOfflineMode = false,
  lastSaveStatus,
  onRetryConnection
}: SaveButtonProps) {
  const getButtonLabel = () => {
    if (isSaving) return "Enregistrement...";
    if (lastSaveStatus === 'error') return "Réessayer";
    if (isOfflineMode) return "Sauvegarder en local";
    if (!isAuthenticated) return "Connectez-vous pour sauvegarder";
    return "Sauvegarder";
  };
  
  const getButtonIcon = () => {
    if (isSaving) return <LoadingIndicator size="sm" className="mr-2" />;
    if (lastSaveStatus === 'error') return <AlertCircle className="h-4 w-4 mr-2 text-destructive" />;
    if (lastSaveStatus === 'success') return <Check className="h-4 w-4 mr-2 text-green-500" />;
    if (isOfflineMode) return <WifiOff className="h-4 w-4 mr-2" />;
    return <SaveAll className="h-4 w-4 mr-2" />;
  };

  const getButtonVariant = () => {
    if (lastSaveStatus === 'error') return "destructive";
    if (isOfflineMode) return "secondary";
    return "default";
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSave}
        disabled={isSaving || (!isAuthenticated && !isOfflineMode)}
        className="flex items-center"
        variant={getButtonVariant() as any}
      >
        {getButtonIcon()}
        {getButtonLabel()}
      </Button>

      {isOfflineMode && onRetryConnection && (
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRetryConnection}
          title="Tenter de reconnecter"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
