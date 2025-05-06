
import { useState, useEffect } from "react";
import ResourcesList from "@/components/journey/ResourcesList";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { supabase } from "@/integrations/supabase/client";

interface ResourcesTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle?: string;
}

export default function ResourcesTab({ stepId, substepTitle, stepTitle }: ResourcesTabProps) {
  const [manualResources, setManualResources] = useState<any[]>([]);
  const [manualLoading, setManualLoading] = useState<boolean>(true);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  // Manual fetch for debugging
  useEffect(() => {
    const fetchResourcesManually = async () => {
      setManualLoading(true);
      console.log("🔍 Manual Fetch Starting...", stepId, substepTitle);
      
      try {
        let qb = supabase
          .from("entrepreneur_resources")
          .select("*")
          .eq("step_id", stepId);
          
        if (substepTitle) {
          qb = qb.eq("substep_title", substepTitle);
          console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title=${substepTitle}`);
        } else {
          qb = qb.is("substep_title", null);
          console.log(`⚙️ Query: entrepreneur_resources where step_id=${stepId} and substep_title IS NULL`);
        }
        
        // Execute query
        const { data, error } = await qb;
        
        if (error) {
          console.error("❌ Error:", error);
          setDiagnosticInfo({
            type: "error",
            message: error.message,
            details: error
          });
        } else {
          console.log("✅ Returned:", data);
          setManualResources(data || []);
          setDiagnosticInfo({
            type: "success",
            count: data?.length || 0,
            data: data
          });
        }
      } catch (err) {
        console.error("❌ Exception:", err);
        setDiagnosticInfo({
          type: "exception",
          message: err instanceof Error ? err.message : "Unknown error",
          error: err
        });
      } finally {
        setManualLoading(false);
      }
    };
    
    fetchResourcesManually();
  }, [stepId, substepTitle]);

  return (
    <div>
      <ResourcesList 
        stepId={stepId} 
        substepTitle={substepTitle}
        stepTitle={stepTitle}
      />
      
      {/* Manual resources display for debugging */}
      <div className="mt-8 border-t pt-4">
        <h3 className="font-medium mb-2">Ressources (Manual Fetch)</h3>
        {manualLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingIndicator size="sm" />
            <span className="ml-2 text-sm text-muted-foreground">Chargement manuel...</span>
          </div>
        ) : manualResources.length > 0 ? (
          <div className="space-y-2">
            {manualResources.map((resource, idx) => (
              <div key={idx} className="p-3 bg-slate-700/30 rounded">
                <h4 className="font-medium">{resource.title || 'Sans titre'}</h4>
                <p className="text-sm text-muted-foreground">{resource.description || 'Pas de description'}</p>
                <div className="text-xs mt-1 text-muted-foreground">
                  Type: {resource.resource_type || 'N/A'}, 
                  Component: {resource.component_name || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Aucune ressource trouvée manuellement. Vérifiez les logs.
            </p>
            <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-auto">
              {`SELECT * FROM entrepreneur_resources 
WHERE step_id = ${stepId} 
${substepTitle ? `AND substep_title = '${substepTitle}'` : 'AND substep_title IS NULL'}`}
            </pre>
          </div>
        )}
      </div>
      
      {/* Diagnostic Information */}
      {diagnosticInfo && (
        <div className={`mt-4 p-4 rounded-md ${diagnosticInfo.type === 'success' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <h3 className="font-medium mb-2">Diagnostic Information</h3>
          <pre className="text-xs overflow-auto max-h-40 p-2 bg-slate-900/50 rounded">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
