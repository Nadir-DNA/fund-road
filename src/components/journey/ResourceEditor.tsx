
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useResourceData } from '@/hooks/useResourceData';

interface ResourceEditorProps {
  stepId: number;
  substepTitle: string;
  resourceType: string;
  title: string;
}

export default function ResourceEditor({ stepId, substepTitle, resourceType, title }: ResourceEditorProps) {
  const [content, setContent] = useState('');
  
  const {
    formData,
    isLoading,
    isSaving,
    handleFormChange,
    handleSave
  } = useResourceData(stepId, substepTitle, resourceType, { content: '' });
  
  useEffect(() => {
    if (formData?.content) {
      setContent(formData.content);
    }
  }, [formData]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleFormChange('content', e.target.value);
  };
  
  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadAsText}
            disabled={!content}
          >
            <Download className="h-4 w-4 mr-1" /> Exporter
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>
      
      <Textarea 
        value={content}
        onChange={handleContentChange}
        placeholder="Saisissez votre texte ici..."
        className="min-h-[300px] font-mono"
      />
      
      <div className="text-xs text-muted-foreground">
        <FileText className="inline h-3 w-3 mr-1" />
        Les modifications sont sauvegardées automatiquement lors de l'export ou en cliquant sur Sauvegarder.
      </div>
    </div>
  );
}
