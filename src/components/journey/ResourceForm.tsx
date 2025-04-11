
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DownloadIcon, Save, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResourceFormProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
  description: string;
  children: React.ReactNode;
  onDataSaved?: (data: any) => void;
  defaultValues?: any;
}

// Définir un type pour les données de ressource utilisateur
interface UserResource {
  id?: string;
  user_id: string;
  step_id: number;
  substep_title: string;
  resource_type: string;
  content: any;
  created_at?: string;
  updated_at?: string;
}

export default function ResourceForm({
  stepId,
  substepTitle,
  resourceType,
  title,
  description,
  children,
  onDataSaved,
  defaultValues = {}
}: ResourceFormProps) {
  const [formData, setFormData] = useState<any>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Récupérer les données sauvegardées au chargement
  useEffect(() => {
    const fetchSavedData = async () => {
      setIsLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Utiliser le type générique pour spécifier le type de retour
        const { data, error } = await supabase
          .from('user_resources')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('step_id', stepId)
          .eq('substep_title', substepTitle)
          .eq('resource_type', resourceType)
          .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur
          
        if (error) {
          console.error("Error fetching data:", error);
        }
        
        if (data) {
          // Accéder au contenu de manière sécurisée
          const resourceData = data as UserResource;
          setFormData(resourceData.content || {});
          if (onDataSaved) onDataSaved(resourceData.content || {});
        }
      } catch (error) {
        console.error("Error fetching saved data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedData();
  }, [stepId, substepTitle, resourceType]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Vérifier si l'utilisateur est connecté
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour sauvegarder vos ressources.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // S'assurer que formData n'est pas null ou undefined
      const safeFormData = formData || {};
      
      // Préparer les données pour l'upsert
      const resourceData: UserResource = {
        user_id: session.session.user.id,
        step_id: stepId,
        substep_title: substepTitle,
        resource_type: resourceType,
        content: safeFormData,
      };
      
      // Upsert (insert ou update)
      const { error } = await supabase
        .from('user_resources')
        .upsert(resourceData, { onConflict: 'user_id,step_id,substep_title,resource_type' });
        
      if (error) throw error;
      
      toast({
        title: "Ressource sauvegardée",
        description: "Vos données ont été enregistrées avec succès."
      });
      
      if (onDataSaved) onDataSaved(safeFormData);
      
    } catch (error: any) {
      console.error("Error saving resource:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportToFile = async (format: "pdf" | "docx" | "xlsx") => {
    setIsExporting(true);
    
    // Demander le nom du projet pour l'ajouter au document
    const projectName = prompt("Nom de votre projet pour l'export :", "Mon Projet");
    
    if (!projectName) {
      setIsExporting(false);
      return; // L'utilisateur a annulé
    }
    
    try {
      // Formatage des données pour l'export
      const exportData = {
        ...formData,
        projectName,
        resourceType,
        title,
        exportDate: new Date().toLocaleDateString(),
      };
      
      // Dans une application réelle, il faudrait implémenter la génération de fichier
      // Pour le moment, simulons l'export avec un délai
      setTimeout(() => {
        // Simuler la création d'un blob pour téléchargement
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        // Nom du fichier selon le format
        const filename = `${resourceType.replace(/\s+/g, "_")}_${projectName.replace(/\s+/g, "_")}.${format}`;
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export réussi",
          description: `Le fichier ${filename} a été téléchargé.`
        });
      }, 1000);
    } catch (error) {
      console.error("Error exporting file:", error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export du fichier.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {/* Injecter les éléments de formulaire spécifiques */}
        {children}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 pt-4 mt-4">
        <div>
          <Button 
            variant="outline" 
            onClick={() => handleSave()} 
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-500 border-t-white rounded-full"/>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </span>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue="pdf" className="w-auto">
          <TabsList className="grid grid-cols-3 w-[200px]">
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="docx">DOCX</TabsTrigger>
            <TabsTrigger value="xlsx">XLSX</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf">
            <Button 
              variant="outline"
              onClick={() => exportToFile("pdf")}
              disabled={isExporting}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              {isExporting ? "Export..." : "Export PDF"}
            </Button>
          </TabsContent>
          <TabsContent value="docx">
            <Button 
              variant="outline"
              onClick={() => exportToFile("docx")}
              disabled={isExporting}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              {isExporting ? "Export..." : "Export DOCX"}
            </Button>
          </TabsContent>
          <TabsContent value="xlsx">
            <Button 
              variant="outline"
              onClick={() => exportToFile("xlsx")}
              disabled={isExporting}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              {isExporting ? "Export..." : "Export XLSX"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  );
}
