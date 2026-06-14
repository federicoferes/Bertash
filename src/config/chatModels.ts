// Modelos de chat disponibles para Berta (vía OpenRouter).
// IDs verificados contra https://openrouter.ai/api/v1/models (jun 2026).

export type ChatModel = {
    id: string;
    name: string;
    provider: 'Anthropic' | 'Google' | 'OpenAI' | 'Gratis';
    color: string;
    bg: string;
    vision: boolean;
    note?: string;
};

export const CHAT_MODELS: ChatModel[] = [
    // ── Anthropic ──
    { id: 'anthropic/claude-opus-4.8', name: 'Claude Opus 4.8', provider: 'Anthropic', color: 'text-orange-400', bg: 'bg-orange-400/10', vision: true, note: 'Máxima calidad' },
    { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', color: 'text-orange-500', bg: 'bg-orange-500/10', vision: true, note: 'Balance (recomendado)' },
    { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', color: 'text-orange-300', bg: 'bg-orange-300/10', vision: true, note: 'Rápido y barato' },
    // ── Google ──
    { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', provider: 'Google', color: 'text-blue-500', bg: 'bg-blue-500/10', vision: true, note: 'Top de Google' },
    { id: 'google/gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Google', color: 'text-blue-400', bg: 'bg-blue-400/10', vision: true, note: 'Rápido' },
    // ── OpenAI ──
    { id: 'openai/gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', color: 'text-green-500', bg: 'bg-green-500/10', vision: true, note: 'Flagship OpenAI' },
    { id: 'openai/gpt-5.4-mini', name: 'GPT-5.4 Mini', provider: 'OpenAI', color: 'text-green-400', bg: 'bg-green-400/10', vision: true, note: 'Económico' },
    // ── Gratis ──
    { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (free)', provider: 'Gratis', color: 'text-emerald-400', bg: 'bg-emerald-400/10', vision: true, note: 'Sin costo, para pruebas' },
];

export const DEFAULT_CHAT_MODEL = 'anthropic/claude-sonnet-4.6';

// Modelo multimodal usado para OCR de imágenes en la edge function vision-extract.
export const VISION_OCR_MODEL = 'anthropic/claude-haiku-4.5';

export const CHAT_MODELS_BY_ID = Object.fromEntries(CHAT_MODELS.map((m) => [m.id, m]));
