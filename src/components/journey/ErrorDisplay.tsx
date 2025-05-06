
interface ErrorDisplayProps {
  message: string;
  details?: Record<string, any>;
}

export default function ErrorDisplay({ message, details }: ErrorDisplayProps) {
  const handleRetry = () => {
    if (details?.retry && typeof details.retry === 'function') {
      details.retry();
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
        <h2 className="text-xl font-medium text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h2>
        <p className="text-red-600 dark:text-red-300">{message}</p>

        {details?.retry && (
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Réessayer
          </button>
        )}

        {details && process.env.NODE_ENV !== 'production' && (
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
