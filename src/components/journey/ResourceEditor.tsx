
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
      // Store initial content to prevent unnecessary saves
      if (!lastSavedContentRef.current) {
        lastSavedContentRef.current = formData.content;
      }
    }
  }, [formData]);
  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const newContent = textarea.value;
    
    // Store current cursor position
    cursorPositionRef.current = textarea.selectionStart;
    
    setContent(newContent);
    
    // Add debouncing for form changes to reduce unnecessary state updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      handleFormChange('content', newContent);
    }, 300);
    
    // Restore cursor position after React update
    requestAnimationFrame(() => {
      if (textareaRef.current && cursorPositionRef.current !== null) {
        textareaRef.current.setSelectionRange(
          cursorPositionRef.current,
          cursorPositionRef.current
        );
      }
    });
  }, [handleFormChange]);
  
  const handleSaveClick = useCallback(() => {
    // Only save if content has actually changed
    if (content !== lastSavedContentRef.current) {
      console.log("Content changed, saving...");
      const saveResult = handleSave();
      if (saveResult) {
        lastSavedContentRef.current = content;
      }
    } else {
      console.log("Content unchanged, skipping save");
    }
  }, [content, handleSave]);
  
  const downloadAsText = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Update last saved content after download
    if (content !== lastSavedContentRef.current) {
      handleSaveClick();
    }
  }, [content, title, handleSaveClick]);
  
  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  if (isLoading) {
    return (
      <Card className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 max-w-[95vw] lg:max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadAsText}
            disabled={!content}
            type="button"
          >
            <Download className="h-4 w-4 mr-1" /> Exporter
          </Button>
          <Button 
            onClick={handleSaveClick}
            disabled={isSaving || content === lastSavedContentRef.current}
            size="sm"
            type="button"
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
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Saisissez votre texte ici..."
        className="min-h-[450px] font-mono"
      />
      
      <div className="text-xs text-muted-foreground">
        <FileText className="inline h-3 w-3 mr-1" />
        Les modifications sont sauvegardées automatiquement lors de l'export ou en cliquant sur Sauvegarder.
      </div>
    </div>
  );
}
