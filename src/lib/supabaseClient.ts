import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase compartido. En Lovable se configura en Project Settings → Env Vars.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
    supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Invoca una Edge Function de Supabase y devuelve su JSON.
 * Lanza un Error con mensaje claro si Supabase no está configurado o la función falla.
 */
export async function invokeFunction<T = unknown>(
    name: string,
    body: unknown
): Promise<T> {
    if (!supabase) {
        throw new Error(
            'Supabase no está configurado. Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
        );
    }
    const { data, error } = await supabase.functions.invoke(name, {
        body: body as Record<string, unknown>,
    });
    if (error) {
        // Supabase envuelve el error; intentamos extraer el mensaje real de la función
        let detail = error.message;
        try {
            const ctx = (error as { context?: { body?: string } }).context;
            if (ctx?.body) {
                const parsed = JSON.parse(ctx.body);
                if (parsed?.error) detail = parsed.error;
            }
        } catch {
            /* noop */
        }
        throw new Error(detail);
    }
    if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
    }
    return data as T;
}
