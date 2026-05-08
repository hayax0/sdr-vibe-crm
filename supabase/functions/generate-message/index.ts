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

  let fallbackMessage = "Olá! Gostaria de agendar uma breve conversa?";

  try {
    const { lead, campaign } = await req.json();
    console.log("PAYLOAD RECEBIDO:", { lead, campaign });

    // Prepara a mensagem de segurança caso algo falhe (Plano B)
    fallbackMessage = `Olá ${lead?.name || "cliente"}, vi que você atua como ${
      lead?.job_title || "profissional"
    } na ${
      lead?.company || "sua empresa"
    }. Gostaria de agendar uma breve conversa?`;

    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      console.error(
        "ERRO CRÍTICO: GEMINI_API_KEY não foi encontrada no ambiente.",
      );
      return new Response(
        JSON.stringify({ error: "Chave de API do Gemini não configurada." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    const persona = campaign?.prompt_persona || "um SDR sênior";
    const contexto =
      campaign?.description || "um novo produto para melhorar resultados";
    const leadName = lead?.name || "cliente";
    const leadRole = lead?.job_title || "profissional";
    const leadCompany = lead?.company || "sua empresa";

    const promptText = `Aja como: ${persona}. O contexto da oferta é: ${contexto}. Gere uma mensagem para o lead ${leadName} que é ${leadRole} na ${leadCompany}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      },
    );

    // Tratamento de Resposta do Google (CRÍTICO)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ERRO DO GOOGLE (Status ${response.status}):`, errorText);
      throw new Error(
        `Falha na API do Google Gemini. Status: ${response.status}`,
      );
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiMessage) {
      console.error(
        "A API do Google retornou sucesso, mas não enviou um texto de resposta válido:",
        data,
      );
      throw new Error("Formato de resposta inesperado do Gemini.");
    }

    return new Response(JSON.stringify({ variations: [aiMessage] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("EXCEÇÃO CAPTURADA NO CATCH (Fallback Ativado):", error);

    // Retorna o fallback com status 200 para não quebrar a UI do frontend
    return new Response(JSON.stringify({ variations: [fallbackMessage] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
