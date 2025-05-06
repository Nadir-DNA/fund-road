
import React, { useEffect, useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import SaveButton from "./resource-form/SaveButton";
import { useResourceData } from "@/hooks/useResourceData";
import { supabase } from "@/integrations/supabase/client";
import { saveLastSaveTime, wasSaveSuccessful } from "@/utils/navigationUtils";
import ResourceFormHeader from "./resource-form/ResourceFormHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showLoading, setShowLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [forceShowContent, setForceShowContent] = useState(false);
  
  // State to track user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
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
      } catch (err) {
        console.warn("Auth check failed:", err);
        // Continue without auth - will use offline mode
      }
    };
    
    checkAuth();
  }, []);

  // Force showing the form content after a timeout to prevent indefinite loading
  useEffect(() => {
    const forceShowTimer = setTimeout(() => {
      setForceShowContent(true);
      setShowLoading(false);
    }, 5000); // Show form after 5 seconds regardless of loading state
    
    return () => clearTimeout(forceShowTimer);
  }, []);

  // Use the resource data hook to handle loading/saving with improved offline support
  const {
    formData: resourceData,
    isLoading,
    isSaving,
    isOfflineMode,
    showOfflineWarning,
    handleFormChange,
    handleSave,
    handleManualSave,
    session,
    retryLoading
  } = useResourceData(stepId, substepTitle, resourceType, formData, onDataSaved);

  // Add a buffer to loading state to prevent flickering, but with a shorter delay
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    } else {
      // Delay turning off loading indicator to prevent flickering, but make it shorter
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, 300); // Reduced from 500ms to 300ms
      
      setLoadingTimeout(timeout);
    }
    
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [isLoading]);

  // Effect to show success toast after saving
  useEffect(() => {
    if (wasSaveSuccessful() && !isSaving) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }, [isSaving]);

  // Handle manual save button click
  const handleSaveClick = async () => {
    if (!isAuthenticated && !isOfflineMode) {
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
          description: isOfflineMode ? 
            "Vos données ont été sauvegardées localement" : 
            "Vos données ont été sauvegardées",
          variant: "default"
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
        
        {isOfflineMode && (
          <Alert variant="destructive" className="mt-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Mode hors ligne activé. Vos modifications sont sauvegardées localement.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryLoading} 
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reconnecter
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        {showLoading && !forceShowContent ? (
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
                isAuthenticated={isAuthenticated || isOfflineMode} 
                isOfflineMode={isOfflineMode}
              />
              {exportPanel && <div className="ml-4">{exportPanel}</div>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
