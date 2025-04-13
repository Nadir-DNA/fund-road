
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
        .upsert(resourceData, { 
          onConflict: 'user_id,step_id,substep_title,resource_type'
        });
        
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

  // Fonction pour formater les données selon le format d'export demandé
  const formatDataForExport = (data: any, format: "pdf" | "docx" | "xlsx", projectName: string) => {
    // Ajouter des métadonnées communes
    const exportData = {
      ...data,
      projectName,
      resourceType,
      title,
      exportDate: new Date().toLocaleDateString('fr-FR'),
    };

    // Formatter selon le type de ressource
    switch (resourceType) {
      case "business_model_canvas":
        return formatBusinessModelCanvas(exportData);
      case "swot_analysis":
        return formatSWOTAnalysis(exportData);
      case "empathy_map":
        return formatEmpathyMap(exportData);
      case "problem_solution_matrix":
        return formatProblemSolutionMatrix(exportData);
      case "mvp_selector":
        return formatMVPSelector(exportData);
      case "cap_table":
        return formatCapTable(exportData);
      default:
        return exportData;
    }
  };

  // Formatters spécifiques pour chaque type de ressource
  const formatBusinessModelCanvas = (data: any) => {
    return {
      title: `Business Model Canvas - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        { name: "Partenaires clés", content: data.key_partners || "" },
        { name: "Activités clés", content: data.key_activities || "" },
        { name: "Ressources clés", content: data.key_resources || "" },
        { name: "Proposition de valeur", content: data.value_propositions || "" },
        { name: "Relations clients", content: data.customer_relationships || "" },
        { name: "Canaux de distribution", content: data.channels || "" },
        { name: "Segments clients", content: data.customer_segments || "" },
        { name: "Structure de coûts", content: data.cost_structure || "" },
        { name: "Sources de revenus", content: data.revenue_streams || "" }
      ]
    };
  };

  const formatSWOTAnalysis = (data: any) => {
    return {
      title: `Analyse SWOT - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        { name: "Forces", content: data.strengths || "" },
        { name: "Faiblesses", content: data.weaknesses || "" },
        { name: "Opportunités", content: data.opportunities || "" },
        { name: "Menaces", content: data.threats || "" },
        { name: "Stratégie S-O", content: data.strategy_so || "" },
        { name: "Stratégie S-T", content: data.strategy_st || "" },
        { name: "Stratégie W-O", content: data.strategy_wo || "" },
        { name: "Stratégie W-T", content: data.strategy_wt || "" }
      ]
    };
  };

  const formatEmpathyMap = (data: any) => {
    return {
      title: `Matrice d'Empathie - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        { name: "Utilisateur", content: `${data.persona_name || ""}${data.persona_role ? ` - ${data.persona_role}` : ""}${data.persona_age ? ` (${data.persona_age} ans)` : ""}` },
        { name: "Ce qu'il pense et dit", content: data.thinks_says || "" },
        { name: "Ce qu'il ressent", content: data.feels || "" },
        { name: "Ce qu'il entend", content: data.hears || "" },
        { name: "Ce qu'il voit", content: data.sees || "" },
        { name: "Ce qu'il fait", content: data.does || "" },
        { name: "Points douloureux", content: data.pains || "" },
        { name: "Gains potentiels", content: data.gains || "" },
        { name: "Objectifs", content: data.goals || "" }
      ]
    };
  };

  const formatProblemSolutionMatrix = (data: any) => {
    return {
      title: `Matrice Problème-Solution - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        { name: "Proposition de valeur", content: data.value_proposition || "" },
        { name: "Segment cible", content: data.target_users || "" },
        { name: "Problème 1", content: data.problem1 || "" },
        { name: "Solution 1", content: data.problem1_solution || "" },
        { name: "Validation 1", content: data.problem1_validation || "" },
        { name: "Problème 2", content: data.problem2 || "" },
        { name: "Solution 2", content: data.problem2_solution || "" },
        { name: "Validation 2", content: data.problem2_validation || "" },
        { name: "Problème 3", content: data.problem3 || "" },
        { name: "Solution 3", content: data.problem3_solution || "" },
        { name: "Validation 3", content: data.problem3_validation || "" }
      ]
    };
  };
  
  const formatMVPSelector = (data: any) => {
    if (!data.features) return { title: `MVP Selector - ${data.projectName || 'Mon Projet'}`, sections: [] };
    
    const mvpFeatures = data.features.filter((f: any) => f.inMvp);
    const futureFeatures = data.features.filter((f: any) => !f.inMvp);
    
    const getPriorityLabel = (priority: string) => {
      switch (priority) {
        case 'must': return 'Must have';
        case 'should': return 'Should have';
        case 'could': return 'Could have';
        case 'wont': return 'Won\'t have';
        default: return '';
      }
    };
    
    return {
      title: `Sélecteur de MVP - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        { 
          name: "Fonctionnalités MVP", 
          content: mvpFeatures.map((f: any) => 
            `${f.name} (${getPriorityLabel(f.priority)}) - Impact: ${f.impact}, Complexité: ${f.complexity}\n${f.description}`
          ).join('\n\n') 
        },
        { 
          name: "Fonctionnalités futures", 
          content: futureFeatures.map((f: any) => 
            `${f.name} (${getPriorityLabel(f.priority)}) - Impact: ${f.impact}, Complexité: ${f.complexity}\n${f.description}`
          ).join('\n\n') 
        }
      ]
    };
  };
  
  const formatCapTable = (data: any) => {
    if (!data.shareholders) return { title: `Cap Table - ${data.projectName || 'Mon Projet'}`, sections: [] };
    
    return {
      title: `Table de Capitalisation - ${data.projectName}`,
      date: data.exportDate,
      sections: [
        {
          name: "Actionnaires",
          content: data.shareholders.map((s: any) => 
            `${s.name}: ${s.shares} actions (${s.percentage}%)`
          ).join('\n')
        },
        {
          name: "Investissements",
          content: data.investmentHistory ? data.investmentHistory.map((inv: any) => 
            `${inv.investor}: ${inv.amount} € (${inv.shares} actions)`
          ).join('\n') : "Aucun investissement"
        }
      ]
    };
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
      // Formatage des données pour l'export selon le type de ressource
      const exportData = formatDataForExport(formData, format, projectName);
      
      // Création du contenu selon le format
      let contentType = "";
      let blob;
      
      switch (format) {
        case "pdf": {
          // Génération de PDF structuré
          const docDefinition = {
            content: [
              { text: exportData.title, style: 'header' },
              { text: `Date: ${exportData.date}`, style: 'subheader' },
              '\n\n'
            ],
            styles: {
              header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
              subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
              sectionHeader: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] },
              content: { fontSize: 12, margin: [0, 0, 0, 10] }
            }
          };
          
          if (exportData.sections) {
            exportData.sections.forEach((section: any) => {
              if (section.content) {
                docDefinition.content.push(
                  { text: section.name, style: 'sectionHeader' },
                  { text: section.content, style: 'content' }
                );
              }
            });
          }
          
          // Convert to HTML for blob creation
          let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${exportData.title}</title>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                h2 { color: #555; margin-top: 20px; }
                p { margin-bottom: 15px; }
              </style>
            </head>
            <body>
              <h1>${exportData.title}</h1>
              <p><strong>Date:</strong> ${exportData.date}</p>
          `;
          
          if (exportData.sections) {
            exportData.sections.forEach((section: any) => {
              if (section.content) {
                htmlContent += `
                  <h2>${section.name}</h2>
                  <p>${section.content.replace(/\n/g, '<br>')}</p>
                `;
              }
            });
          }
          
          htmlContent += `
            </body>
            </html>
          `;
          
          blob = new Blob([htmlContent], { type: "text/html" });
          contentType = "text/html";
          break;
        }
          
        case "docx": {
          // Génération de DOCX structuré (simulé avec HTML)
          let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${exportData.title}</title>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Cambria', serif; margin: 2.5cm; }
                h1 { color: #000; }
                h2 { color: #333; margin-top: 24pt; }
                p { margin-bottom: 12pt; line-height: 1.5; }
              </style>
            </head>
            <body>
              <h1>${exportData.title}</h1>
              <p><strong>Date:</strong> ${exportData.date}</p>
          `;
          
          if (exportData.sections) {
            exportData.sections.forEach((section: any) => {
              if (section.content) {
                htmlContent += `
                  <h2>${section.name}</h2>
                  <p>${section.content.replace(/\n/g, '<br>')}</p>
                `;
              }
            });
          }
          
          htmlContent += `
            </body>
            </html>
          `;
          
          blob = new Blob([htmlContent], { type: "text/html" });
          contentType = "text/html";
          break;
        }
          
        case "xlsx": {
          // Génération de XLSX structuré (simulé avec CSV)
          let csvContent = `"${exportData.title}"\n"Date: ${exportData.date}"\n\n`;
          
          if (exportData.sections) {
            exportData.sections.forEach((section: any) => {
              if (section.content) {
                // Nettoyer les guillemets dans le contenu pour éviter les problèmes de format CSV
                const cleanContent = section.content.replace(/"/g, '""');
                csvContent += `"${section.name}","${cleanContent}"\n`;
              }
            });
          }
          
          blob = new Blob([csvContent], { type: "text/csv" });
          contentType = "text/csv";
          break;
        }
      }
      
      // Création du lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Nom du fichier selon le format et le type de ressource
      const resourceTypeSafe = resourceType.replace(/\s+/g, "_");
      const projectNameSafe = projectName.replace(/\s+/g, "_");
      const filename = `${resourceTypeSafe}_${projectNameSafe}.${format}`;
      
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
