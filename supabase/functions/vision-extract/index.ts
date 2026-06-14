import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Modelo multimodal usado para extraer texto de imágenes (OCR + descripción).
// Claude no gasta budget en reasoning por defecto → devuelve el texto directo.
const VISION_MODEL = 'anthropic/claude-haiku-4.5'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, model } = await req.json()
    if (!image || typeof image !== 'string') {
      throw new Error('Falta la imagen (data URL en base64).')
    }

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) {
      throw new Error('OPENROUTER_API_KEY no está configurada en Supabase secrets')
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://bertash.ai',
        'X-Title': 'Bertash',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || VISION_MODEL,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content:
              'Sos un extractor de texto (OCR). Devolvé TODO el texto visible en la imagen, transcrito fielmente y en orden de lectura. Si no hay texto, describí brevemente el contenido de la imagen. Respondé solo con el contenido, sin comentarios extra.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraé el texto de esta imagen:' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      let errorMessage = 'OpenRouter request failed'
      try {
        const errorJson = JSON.parse(errorBody)
        errorMessage = errorJson.error?.message || errorMessage
      } catch {
        errorMessage = errorBody
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
