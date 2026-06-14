import { supabase } from './supabaseClient';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenRouterSettings = {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
};

export const callOpenRouter = async (
  messages: ChatMessage[],
  model: string,
  settings?: OpenRouterSettings
) => {
  const body = {
    model,
    messages,
    temperature: settings?.temperature ?? 0.72,
    max_tokens: settings?.max_tokens ?? 4096,
    top_p: settings?.top_p ?? 0.95,
  };

  // Ruta preferida: Edge Function de Supabase (segura, funciona en Lovable)
  if (supabase) {
    const { data, error } = await supabase.functions.invoke('chat', {
      body,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Fallback: llamada directa (solo para desarrollo local con .env)
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'No se encontró la configuración. ' +
      'Para producción/Lovable: configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
      'Para desarrollo local: agregá VITE_OPENROUTER_API_KEY al archivo .env'
    );
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://bertash.ai',
      'X-Title': 'Bertash',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = 'Failed to fetch from OpenRouter';
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch {
      errorMessage = errorBody;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
