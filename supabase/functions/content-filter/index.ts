import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking content for inappropriate material");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un filtro de contenido. Analiza si el siguiente texto contiene:
- Contenido político
- Contenido pornográfico
- Contenido erótico o sexual explícito
- Lenguaje inapropiado extremo

Responde SOLO con "SI" si el contenido es inapropiado o "NO" si es apropiado.
No des explicaciones, solo SI o NO.`
          },
          {
            role: "user",
            content: content
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI filter error:", response.status);
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const filterResult = data.choices[0].message.content.trim().toUpperCase();
    
    const allowed = filterResult !== "SI";
    
    console.log("Filter result:", { allowed, filterResult });

    return new Response(
      JSON.stringify({ 
        allowed,
        reason: allowed ? null : "Contenido no permitido: política, pornografía o contenido inapropiado"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in content-filter:", error);
    return new Response(
      JSON.stringify({ allowed: true }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
