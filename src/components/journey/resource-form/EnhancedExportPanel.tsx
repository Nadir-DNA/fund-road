import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatResourceData } from "./formatters";
import { generatePDF, generateWord } from "./advancedExportUtils";

interface EnhancedExportPanelProps {
  formData: any;
  resourceType: string;
  title?: string;
  className?: string;
}

export default function EnhancedExportPanel({ 
  formData, 
  resourceType, 
  title,
  className = "" 
}: EnhancedExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'pdf' | 'word') => {
    setIsExporting(true);
    
    try {
      const exportData = formatResourceData(formData, resourceType);
      const resourceTitle = title || exportData.title;
      
      if (format === 'pdf') {
        await generatePDF(exportData, resourceTitle, resourceType);
        toast({
          title: "PDF généré !",
          description: "Votre document a été téléchargé."
        });
      } else {
        await generateWord(exportData, resourceTitle, resourceType);
        toast({
          title: "Document Word généré !",
          description: "Votre fichier a été téléchargé."
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le document.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Check if there's data to export
  const hasData = formData && Object.values(formData).some(value => 
    value && String(value).trim() !== ""
  );

  if (!hasData) {
    return (
      <div className={`p-4 border border-dashed border-border rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground text-center">
          Commencez à remplir le formulaire pour activer l'export
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-card border rounded-lg space-y-3 ${className}`}>
      <h4 className="font-medium flex items-center gap-2">
        <Download className="h-4 w-4" />
        Télécharger votre travail
      </h4>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex-1"
        >
          <FileImage className="h-4 w-4 mr-2" />
          {isExporting ? 'Génération...' : 'PDF'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('word')}
          disabled={isExporting}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? 'Génération...' : 'Word'}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Exportez votre progression pour la conserver ou la partager.
      </p>
    </div>
  );
}