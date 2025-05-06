
import { Resource } from "@/types/journey";
import DynamicResourceComponent from "./DynamicResourceComponent";

interface ResourceDisplayProps {
  resource: Resource;
  stepId: number;
  substepTitle: string;
}

const ResourceDisplay = ({ resource, stepId, substepTitle }: ResourceDisplayProps) => {
  return (
    <div key={resource.id} className="bg-slate-700/30 rounded-lg p-6">
      <h3 className="font-medium mb-3">{resource.title || "Ressource sans titre"}</h3>
      
      {resource.url ? (
        <a 
          href={resource.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ouvrir la ressource externe
        </a>
      ) : resource.componentName ? (
        <DynamicResourceComponent 
          componentName={resource.componentName} 
          stepId={Number(stepId)} 
          substepTitle={substepTitle || ""}
        />
      ) : (
        <p className="text-muted-foreground">Cette ressource n'a pas de contenu affichable.</p>
      )}
    </div>
  );
};

export default ResourceDisplay;
