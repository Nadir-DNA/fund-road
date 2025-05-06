
interface NoResourcesDisplayProps {
  substepTitle: string;
  stepId: number;
}

export default function NoResourcesDisplay({ substepTitle, stepId }: NoResourcesDisplayProps) {
  return (
    <div className="container mx-auto py-12">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
        <h2 className="text-xl font-medium mb-2">Aucune ressource trouvée</h2>
        <p>Aucune ressource disponible pour {substepTitle} (étape {stepId}).</p>
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
          {JSON.stringify({ stepId, substepTitle }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
