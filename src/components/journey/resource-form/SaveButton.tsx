
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, LogIn, CheckCircle } from "lucide-react";
import { wasSaveSuccessful, getLastSaveTime } from "@/utils/navigationUtils";

interface SaveButtonProps {
  isSaving: boolean;
  handleSave: () => void;
  isAuthenticated?: boolean;
}

export default function SaveButton({ isSaving, handleSave, isAuthenticated = true }: SaveButtonProps) {
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);

  useEffect(() => {
    // Check if last save was successful when component mounts or isSaving changes
    if (!isSaving) {
      const success = wasSaveSuccessful();
      setSaveSuccess(success);
      if (success) {
        setLastSaveTime(getLastSaveTime());
        
        // Reset success state after 3 seconds
        const timer = setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isSaving]);

  // Format the last save time for display
  const formatSaveTime = (timeString: string | null): string => {
    if (!timeString) return "";
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="flex flex-col">
      <Button 
        variant={saveSuccess ? "secondary" : "outline"}
        onClick={handleSave} 
        disabled={isSaving}
        className="transition-colors duration-300"
      >
        {isSaving ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-white rounded-full"/>
            Enregistrement...
          </span>
        ) : saveSuccess ? (
          <span className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Enregistré
          </span>
        ) : isAuthenticated ? (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </span>
        ) : (
          <span className="flex items-center">
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter pour enregistrer
          </span>
        )}
      </Button>
      {lastSaveTime && (
        <span className="text-xs text-muted-foreground mt-1">
          Dernier enregistrement à {formatSaveTime(lastSaveTime)}
        </span>
      )}
    </div>
  );
}
