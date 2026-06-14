import { invokeFunction } from './supabaseClient';
import type { SocialProfileData } from '../store/useStore';

export type ScrapeResult = Omit<SocialProfileData, 'label' | 'input' | 'isLoading' | 'error'>;

/** Scrapea un perfil de Instagram o TikTok (bio + últimos posts) vía edge function. */
export async function scrapeProfile(
    input: string,
    network?: 'instagram' | 'tiktok'
): Promise<ScrapeResult> {
    return invokeFunction<ScrapeResult>('social-scrape', { input, network });
}
