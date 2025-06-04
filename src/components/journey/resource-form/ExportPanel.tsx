
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatResourceData } from "./formatters";
import { exportToFile } from "./exportUtils";

interface ExportPanelProps {
  formData: any;
  resourceType: string;
}

export default function ExportPanel({
  formData,
  resourceType
}: ExportPanelProps) {
  const [format, setFormat] = useState<"pdf" | "docx" | "xlsx">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Format and transform the data for export
      const formattedData = formatResourceData(formData, resourceType);
      
      // Export to the selected file format
      exportToFile(format, formData, "Mon Projet", resourceType, formattedData);
      
      console.log(`Exporting ${resourceType} as ${format}`);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      // Reset exporting state after a delay to show feedback
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={format} onValueChange={(value: any) => setFormat(value)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="docx">Word</SelectItem>
          <SelectItem value="xlsx">Excel</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <span className="flex items-center">
            <span className="animate-spin mr-1 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            Export...
          </span>
        ) : (
          <span className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </span>
        )}
      </Button>
    </div>
  );
}
