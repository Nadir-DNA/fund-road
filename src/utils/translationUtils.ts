
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
