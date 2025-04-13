
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DownloadIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDataForExport } from "./formatters";
import { exportToFile } from "./exportUtils";

interface ExportPanelProps {
  formData: any;
  resourceType: string;
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}

export default function ExportPanel({ 
  formData, 
  resourceType, 
  isExporting, 
  setIsExporting 
}: ExportPanelProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<"pdf" | "docx" | "xlsx">("pdf");

  const handleExport = async () => {
    setIsExporting(true);
    
    // Ask for project name for the export
    const projectName = prompt("Nom de votre projet pour l'export :", "Mon Projet");
    
    if (!projectName) {
      setIsExporting(false);
      return; // User canceled
    }
    
    try {
      // Format data for export
      const exportData = formatDataForExport(formData, exportFormat, projectName, resourceType);
      
      // Export the file
      exportToFile(exportFormat, formData, projectName, resourceType, exportData);
      
      toast({
        title: "Export réussi",
        description: `Le fichier a été téléchargé.`
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

  return (
    <Tabs 
      defaultValue="pdf" 
      className="w-auto"
      value={exportFormat}
      onValueChange={(value) => setExportFormat(value as "pdf" | "docx" | "xlsx")}
    >
      <TabsList className="grid grid-cols-3 w-[200px]">
        <TabsTrigger value="pdf">PDF</TabsTrigger>
        <TabsTrigger value="docx">DOCX</TabsTrigger>
        <TabsTrigger value="xlsx">XLSX</TabsTrigger>
      </TabsList>
      <TabsContent value="pdf">
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          {isExporting ? "Export..." : "Export PDF"}
        </Button>
      </TabsContent>
      <TabsContent value="docx">
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          {isExporting ? "Export..." : "Export DOCX"}
        </Button>
      </TabsContent>
      <TabsContent value="xlsx">
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          {isExporting ? "Export..." : "Export XLSX"}
        </Button>
      </TabsContent>
    </Tabs>
  );
}
