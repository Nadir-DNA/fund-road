
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Check if DeepL API key is set
    const apiKey = Deno.env.get("DEEPL_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "DeepL API key is not set in environment variables" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Test the DeepL API key with a simple usage request
    const testResponse = await fetch("https://api-free.deepl.com/v2/usage", {
      method: "GET",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
      },
    });
    
    if (!testResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `DeepL API key test failed with status ${testResponse.status}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const usage = await testResponse.json();
    
    // Test a simple translation to verify translation functionality
    const translationResponse = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: "Bonjour",
        target_lang: "EN",
        source_lang: "FR",
      }).toString(),
    });
    
    if (!translationResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `DeepL translation test failed with status ${translationResponse.status}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const translationResult = await translationResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "DeepL API key is valid and translation is working properly",
        usage,
        testTranslation: translationResult.translations[0].text
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Server error", 
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
