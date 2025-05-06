
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, LogIn } from "lucide-react";

interface SaveButtonProps {
  isSaving: boolean;
  handleSave: () => void;
  isAuthenticated?: boolean;
}

export default function SaveButton({ isSaving, handleSave, isAuthenticated = true }: SaveButtonProps) {
  return (
    <div>
      <Button 
        variant="outline" 
        onClick={handleSave} 
        disabled={isSaving}
      >
        {isSaving ? (
          <span className="flex items-center">
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-white rounded-full"/>
            Enregistrement...
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
    </div>
  );
}
