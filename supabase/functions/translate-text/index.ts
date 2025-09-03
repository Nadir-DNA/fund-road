import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, target_lang, source_lang } = await req.json();
    
    if (!text || !target_lang) {
      return new Response(
        JSON.stringify({ error: "Text and target_lang are required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get DeepL API key from environment
    const apiKey = Deno.env.get("DEEPL_API_KEY");
    
    if (!apiKey) {
      console.error("DeepL API key not configured");
      return new Response(
        JSON.stringify({ 
          error: "Translation service not configured",
          translatedText: text // Return original text as fallback
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Call DeepL API
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: text,
        target_lang: target_lang,
        ...(source_lang && { source_lang })
      }).toString(),
    });

    if (!response.ok) {
      console.error(`DeepL API error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: `Translation failed with status ${response.status}`,
          translatedText: text // Return original text as fallback
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const data = await response.json();
    const translatedText = data.translations?.[0]?.text || text;

    return new Response(
      JSON.stringify({ translatedText }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Translation function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        translatedText: "" // Return empty string on critical error
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});