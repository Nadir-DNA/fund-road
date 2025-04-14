
// Translation utility for DeepL API integration
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang?: string
): Promise<string> {
  try {
    // DeepL API URL
    const url = "https://api-free.deepl.com/v2/translate";
    
    // Build request body
    const body = new URLSearchParams();
    body.append("text", text);
    body.append("target_lang", targetLang);
    if (sourceLang) {
      body.append("source_lang", sourceLang);
    }
    
    // DeepL API key is stored securely in Supabase Edge Functions
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${import.meta.env.VITE_DEEPL_API_KEY || ''}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

// Function to translate a batch of texts
export async function translateBatch(
  texts: Record<string, string>,
  targetLang: string,
  sourceLang?: string
): Promise<Record<string, string>> {
  try {
    // For small batches, it's simpler to translate one by one
    const translations: Record<string, string> = {};
    
    for (const [key, text] of Object.entries(texts)) {
      translations[key] = await translateText(text, targetLang, sourceLang);
    }
    
    return translations;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts; // Return original texts if translation fails
  }
}

// Function to translate content fields and prepare them for storage
export async function translateContentFields(
  content: Record<string, any>,
  fieldsToTranslate: string[],
  targetLang: string = "EN",
  sourceLang: string = "FR"
): Promise<Record<string, any>> {
  try {
    const translationPromises: Promise<void>[] = [];
    const result = { ...content }; // Clone the content to avoid modifying the original
    
    fieldsToTranslate.forEach(field => {
      if (content[field] && typeof content[field] === 'string') {
        // Only translate non-empty strings
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
    
    // Wait for all translations to complete
    await Promise.all(translationPromises);
    
    return result;
  } catch (error) {
    console.error("Content translation error:", error);
    return content; // Return original content if translation fails
  }
}

// Function to get the appropriate field based on language
export function getLocalizedField(
  obj: Record<string, any>,
  fieldName: string,
  language: string = "fr"
): any {
  const langLower = language.toLowerCase();
  
  // If not English, or the field doesn't have a language suffix
  if (langLower === "fr") {
    return obj[fieldName];
  }
  
  // Try to get the field with language suffix
  const localizedField = obj[`${fieldName}_${langLower}`];
  
  // Return the localized version if available, otherwise the original
  return localizedField !== undefined && localizedField !== null 
    ? localizedField 
    : obj[fieldName];
}
