import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IG_ACTOR = 'apify~instagram-profile-scraper'
const TT_ACTOR = 'clockworks~tiktok-scraper'

type Network = 'instagram' | 'tiktok'

function detect(input: string): { network: Network | null; username: string } {
  const raw = input.trim()
  const lower = raw.toLowerCase()
  if (lower.includes('tiktok.com')) {
    const m = raw.match(/tiktok\.com\/@?([A-Za-z0-9._]+)/)
    return { network: 'tiktok', username: m ? m[1] : '' }
  }
  if (lower.includes('instagram.com')) {
    const m = raw.match(/instagram\.com\/([A-Za-z0-9._]+)/)
    return { network: 'instagram', username: m ? m[1] : '' }
  }
  // handle suelto: @usuario → no podemos saber la red con certeza
  const handle = raw.replace(/^@/, '')
  return { network: null, username: handle }
}

async function runActor(actor: string, input: unknown, token: string) {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=180`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Apify (${res.status}): ${body.slice(0, 300)}`)
  }
  return await res.json()
}

function normalizeInstagram(items: any[]) {
  const p = items?.[0]
  if (!p) throw new Error('No se encontró el perfil de Instagram (¿privado o inexistente?).')
  const posts = (p.latestPosts || []).slice(0, 12).map((x: any) => ({
    caption: x.caption ?? '',
    likes: x.likesCount ?? null,
    comments: x.commentsCount ?? null,
    views: x.videoViewCount ?? x.videoPlayCount ?? null,
    date: x.timestamp ?? null,
    url: x.url ?? null,
  }))
  return {
    network: 'instagram' as Network,
    username: p.username ?? '',
    fullName: p.fullName ?? '',
    bio: p.biography ?? '',
    followers: p.followersCount ?? null,
    following: p.followsCount ?? null,
    postsCount: p.postsCount ?? null,
    verified: Boolean(p.verified),
    posts,
  }
}

function normalizeTiktok(items: any[]) {
  if (!items?.length) throw new Error('No se encontró el perfil de TikTok (¿privado o inexistente?).')
  const a = items[0].authorMeta || {}
  const posts = items.slice(0, 12).map((x: any) => ({
    caption: x.text ?? '',
    likes: x.diggCount ?? null,
    comments: x.commentCount ?? null,
    views: x.playCount ?? null,
    date: x.createTimeISO ?? null,
    url: x.webVideoUrl ?? null,
  }))
  return {
    network: 'tiktok' as Network,
    username: a.name ?? '',
    fullName: a.nickName ?? '',
    bio: a.signature ?? '',
    followers: a.fans ?? null,
    following: a.following ?? null,
    postsCount: a.video ?? null,
    verified: Boolean(a.verified),
    posts,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, network: networkHint } = await req.json()
    if (!input || typeof input !== 'string') {
      throw new Error('Pegá una URL o @usuario de Instagram o TikTok.')
    }

    const token = Deno.env.get('APIFY_TOKEN')
    if (!token) {
      throw new Error('APIFY_TOKEN no está configurada en Supabase secrets.')
    }

    const det = detect(input)
    const network: Network | null = (networkHint as Network) || det.network
    const username = det.username

    if (!network) {
      throw new Error('No pude detectar la red. Pegá la URL completa del perfil (instagram.com/... o tiktok.com/@...).')
    }
    if (!username) {
      throw new Error('No pude extraer el usuario del enlace.')
    }

    let result
    if (network === 'instagram') {
      const items = await runActor(
        IG_ACTOR,
        { usernames: [username], includeAboutSection: true, resultsLimit: 12 },
        token
      )
      result = normalizeInstagram(items)
    } else {
      const items = await runActor(
        TT_ACTOR,
        { profiles: [username], resultsPerPage: 12, profileScrapeSections: ['videos'], profileSorting: 'latest', shouldDownloadVideos: false, shouldDownloadCovers: false },
        token
      )
      result = normalizeTiktok(items)
    }

    if (!result.posts?.length && !result.bio) {
      throw new Error('El perfil no devolvió datos (puede ser privado).')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
