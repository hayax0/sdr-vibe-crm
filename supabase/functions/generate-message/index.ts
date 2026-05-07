import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lida com CORS
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const { lead } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    // Mensagem de segurança caso o Google falhe (Plano B)
    const fallbackMessage = `Olá ${lead?.name || "cliente"}, vi que você atua como ${lead?.job_title || "profissional"} na ${lead?.company || "sua empresa"}. Gostaria de agendar uma breve conversa?`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Gere um cold email curto para ${lead?.name} da ${lead?.company}.`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

      // Se a IA respondeu, usamos a resposta dela. Se não, usamos a reserva (fallback).
      const finalMessage = aiMessage || fallbackMessage;

      return new Response(JSON.stringify({ variations: [finalMessage] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (googleError) {
      // Se o Google cair, a função ainda responde com sucesso usando o fallback
      return new Response(JSON.stringify({ variations: [fallbackMessage] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
