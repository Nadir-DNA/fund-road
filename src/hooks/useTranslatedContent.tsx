
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { getLocalizedField } from "@/utils/translationUtils";

export interface ContentOptions {
  table: string;
  select?: string;
  translatableFields: string[];
  filter?: Record<string, any>;
}

export function useTranslatedContent<T extends Record<string, any>>(
  options: ContentOptions
): {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  translateContent: (contentId: string) => Promise<void>;
} {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { language } = useLanguage();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from(options.table)
        .select(options.select || '*');
        
      // Apply additional filters if provided
      if (options.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query = query.eq(key, value);
        }
      }
      
      const { data: rawData, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Process the data for localized fields
      const processedData = rawData.map(item => {
        const result = { ...item };
        
        options.translatableFields.forEach(field => {
          const localizedValue = getLocalizedField(item, field, language);
          result[field] = localizedValue;
        });
        
        return result;
      }) as T[];
      
      setData(processedData);
      setError(null);
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error",
        description: `Failed to fetch data: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const translateContent = async (contentId: string) => {
    try {
      const response = await supabase.functions.invoke('translate-content', {
        body: {
          contentType: options.table,
          contentId,
          fields: options.translatableFields,
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Translation failed');
      }
      
      await fetchData(); // Refresh data after translation
      
      toast({
        title: "Success",
        description: "Content successfully translated",
      });
    } catch (err: any) {
      toast({
        title: "Translation Error",
        description: err.message || "Failed to translate content",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, options.table]);

  return {
    data,
    isLoading,
    error,
    refreshData: fetchData,
    translateContent,
  };
}
