// SECURITY FIX: Translation utility that uses secure Supabase Edge Function
// This prevents API key exposure in the frontend
import { supabase } from "@/integrations/supabase/client";

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  try {
    // Use secure Supabase Edge Function for translation
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: {
        text,
        target_lang: targetLang,
        source_lang: sourceLang || 'FR'
      }
    });
    
    if (error) {
      console.error("Translation error:", error);
      return text;
    }
    
    return data?.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function translateBatch(
  texts: Record<string, string>,
  targetLang: string,
  sourceLang?: string
): Promise<Record<string, string>> {
  try {
    const translations: Record<string, string> = {};
    
    for (const [key, text] of Object.entries(texts)) {
      translations[key] = await translateText(text, targetLang, sourceLang);
    }
    
    return translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts;
  }
}

export async function translateContentFields(
  content: Record<string, any>,
  fieldsToTranslate: string[],
  targetLang: string = "EN",
  sourceLang: string = "FR"
): Promise<Record<string, any>> {
  try {
    const translationPromises: Promise<void>[] = [];
    const result = { ...content };
    
    fieldsToTranslate.forEach(field => {
      if (content[field] && typeof content[field] === 'string') {
        if (content[field].trim().length > 0) {
          const promise = translateText(content[field], targetLang, sourceLang)
            .then(translation => {
              result[`${field}_${targetLang.toLowerCase()}`] = translation;
            });
          translationPromises.push(promise);
        } else {
          result[`${field}_${targetLang.toLowerCase()}`] = content[field];
        }
      }
    });
    
    await Promise.all(translationPromises);
    
    return result;
  } catch (error) {
    console.error("Content translation error:", error);
    return content;
  }
}

export function getLocalizedField(
  obj: Record<string, any>,
  fieldName: string,
  language: string = "fr"
): any {
  const langLower = language.toLowerCase();
  
  if (langLower === "fr") {
    return obj[fieldName];
  }
  
  const localizedField = obj[`${fieldName}_${langLower}`];
  
  return localizedField !== undefined && localizedField !== null 
    ? localizedField 
    : obj[fieldName];
}