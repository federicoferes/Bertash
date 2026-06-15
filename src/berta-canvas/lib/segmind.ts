import { invokeFunction } from './supabaseClient';

export type SegmindResult = {
    result_url?: string;
    content_type?: string;
    // Si el modelo es async, Segmind devuelve un JSON de recibo (no usado en modelos sync)
    [key: string]: unknown;
};

/** Genera una imagen vía la edge function segmind-proxy. Devuelve la URL pública en Storage. */
export async function generateImage(
    slug: string,
    params: Record<string, unknown>
): Promise<string> {
    const res = await invokeFunction<SegmindResult>('segmind-proxy', { slug, params });
    if (!res.result_url) {
        throw new Error('Segmind no devolvió una imagen. Revisá el prompt o los parámetros.');
    }
    return res.result_url;
}
