
import React, { useEffect, useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import SaveButton from "./resource-form/SaveButton";
import { useResourceData } from "@/hooks/useResourceData";
import { supabase } from "@/integrations/supabase/client";
import { saveLastSaveTime, wasSaveSuccessful } from "@/utils/navigationUtils";
import ResourceFormHeader from "./resource-form/ResourceFormHeader";

interface ResourceFormProps {
  children: ReactNode;
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  formData: any;
  onDataSaved?: (data: any) => void;
  exportPanel?: ReactNode;
}

export default function ResourceForm({
  children,
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  formData,
  onDataSaved,
  exportPanel
}: ResourceFormProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // State to track user authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setUserId(data.session?.user?.id || null);
      
      // Setup auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id || null);
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);

  // Use the resource data hook to handle loading/saving
  const {
    formData: resourceData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave,
    handleManualSave,
    session,
    retryLoading
  } = useResourceData(stepId, substepTitle, resourceType, formData, onDataSaved);

  // Effect to show success toast after saving
  useEffect(() => {
    if (wasSaveSuccessful() && !isSaving) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }, [isSaving]);

  // Handle manual save button click
  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentification requise",
        description: "Connectez-vous pour enregistrer vos données",
        variant: "destructive"
      });
      return;
    }

    try {
      const success = await handleManualSave(session);
      if (success) {
        toast({
          title: "Enregistrement réussi",
          description: "Vos données ont été sauvegardées",
          variant: "success"
        });
        saveLastSaveTime();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Erreur d'enregistrement",
        description: "Impossible de sauvegarder vos données",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <ResourceFormHeader 
          title={title}
          description={description}
          stepId={stepId}
          substepTitle={substepTitle}
        />
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingIndicator size="md" />
            <span className="ml-2 text-muted-foreground">Chargement des données...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">{children}</div>
            <div className="flex justify-between items-center mt-8">
              <SaveButton 
                isSaving={isSaving} 
                handleSave={handleSaveClick}
                isAuthenticated={isAuthenticated} 
              />
              {exportPanel && <div className="ml-4">{exportPanel}</div>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
