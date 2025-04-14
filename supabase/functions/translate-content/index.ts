
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { contentType, contentId, fields } = await req.json();
    
    // Ensure required parameters are provided
    if (!contentType || !contentId || !fields || !Array.isArray(fields) || fields.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: contentType, contentId, fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch the content
    const { data: contentData, error: fetchError } = await supabase
      .from(contentType)
      .select("*")
      .eq("id", contentId)
      .single();

    if (fetchError || !contentData) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch content", 
          details: fetchError?.message || "Content not found"
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get DeepL API key from environment
    const deeplApiKey = Deno.env.get("DEEPL_API_KEY");
    if (!deeplApiKey) {
      return new Response(
        JSON.stringify({ error: "DeepL API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Prepare texts to translate
    const translations: Record<string, string> = {};
    
    // Translate each field
    for (const field of fields) {
      const text = contentData[field];
      
      // Skip if the field doesn't exist or is empty
      if (!text || text.trim() === "") continue;

      try {
        const response = await fetch("https://api-free.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            "Authorization": `DeepL-Auth-Key ${deeplApiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            text: text,
            target_lang: "EN",
            source_lang: "FR",
          }).toString(),
        });

        if (!response.ok) {
          console.error(`DeepL API error for field ${field}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        translations[`${field}_en`] = data.translations[0].text;
      } catch (translationError) {
        console.error(`Translation error for field ${field}:`, translationError);
      }
    }
    
    // Update the content with translations
    const { error: updateError } = await supabase
      .from(contentType)
      .update(translations)
      .eq("id", contentId);

    if (updateError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to update content with translations", 
          details: updateError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        translations, 
        message: "Content translated and stored successfully" 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
