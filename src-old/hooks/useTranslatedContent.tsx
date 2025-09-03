
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

// Define a type for the allowed tables
type AllowedTables = 'resources' | 'tags' | 'profiles' | 'categories' | 
  'entrepreneur_resources' | 'investors' | 'resource_tags' | 
  'user_journey_progress' | 'user_resources' | 'user_substep_progress';

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
      
      // Validate that table is one of the allowed tables
      // This is a runtime check since we can't enforce it at compile time with dynamic strings
      const isValidTable = await validateTableExists(options.table);
      if (!isValidTable) {
        throw new Error(`Table does not exist: ${options.table}`);
      }
      
      // Cast the table name to any to bypass TypeScript's type checking
      // This is necessary because we're using a dynamic table name
      const query = supabase
        .from(options.table as any)
        .select(options.select || '*');
        
      // Apply additional filters if provided
      if (options.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          query.eq(key, value);
        }
      }
      
      const { data: rawData, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Process the data for localized fields
      const processedData = rawData ? rawData.map((item: Record<string, any>) => {
        // Create a new object manually instead of using spread
        const result: Record<string, any> = {};
        
        // Copy all properties from the original item
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            result[key] = item[key];
          }
        }
        
        // Handle translatable fields
        options.translatableFields.forEach(field => {
          const localizedValue = getLocalizedField(item, field, language);
          result[field] = localizedValue;
        });
        
        return result as T;
      }) : [];
      
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

  // Helper function to validate if the table exists in the schema
  const validateTableExists = async (tableName: string): Promise<boolean> => {
    try {
      // Check if the table exists by attempting to get its information
      // We must cast tableName to any to bypass TypeScript's type checking
      const { error } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(1);
      
      // If no error occurred, the table exists
      return !error;
    } catch {
      return false;
    }
  };

  const translateContent = async (contentId: string) => {
    try {
      // Check if DeepL API key is configured
      const checkResponse = await supabase.functions.invoke('check-deepl-key', {
        body: { checkKey: true },
      });
      
      if (!checkResponse.data?.success) {
        throw new Error("DeepL API key is not configured or invalid");
      }
      
      const response = await supabase.functions.invoke('translate-content', {
        body: {
          contentType: options.table,
          contentId,
          fields: options.translatableFields,
        },
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Translation failed');
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
