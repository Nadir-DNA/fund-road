
import React from 'react';
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Save, SaveAll, WifiOff } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  handleSave: () => void;
  isAuthenticated: boolean;
  isOfflineMode?: boolean;
}

export default function SaveButton({ isSaving, handleSave, isAuthenticated, isOfflineMode = false }: SaveButtonProps) {
  const getButtonLabel = () => {
    if (isSaving) return "Enregistrement...";
    if (isOfflineMode) return "Sauvegarder en local";
    if (!isAuthenticated) return "Connectez-vous pour sauvegarder";
    return "Sauvegarder";
  };
  
  const getButtonIcon = () => {
    if (isSaving) return <LoadingIndicator size="sm" className="mr-2" />;
    if (isOfflineMode) return <WifiOff className="h-4 w-4 mr-2" />;
    return <SaveAll className="h-4 w-4 mr-2" />;
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving || (!isAuthenticated && !isOfflineMode)}
      className="flex items-center"
      variant={isOfflineMode ? "secondary" : "default"}
    >
      {getButtonIcon()}
      {getButtonLabel()}
    </Button>
  );
}
