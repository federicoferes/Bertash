import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Instagram, Music2, Loader2, Search, CheckCircle2, Heart, MessageCircle, Eye, X } from 'lucide-react';
import { useCanvasStore, type SocialProfileData } from '../store';
import { scrapeProfile } from '../lib/social';

function fmt(n?: number | null) {
    if (n == null) return '—';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

export function SocialProfileNode({ id, data }: NodeProps<Node<SocialProfileData>>) {
    const updateNodeData = useCanvasStore((s) => s.updateNodeData);

    const isLoading = Boolean(data.isLoading);
    const hasData = Boolean(data.username || data.bio || data.posts?.length);
    const isTikTok = data.network === 'tiktok';

    const handleScrape = async () => {
        const input = (data.input || '').trim();
        if (!input || isLoading) return;
        updateNodeData(id, { isLoading: true, error: '' });
        try {
            const res = await scrapeProfile(input);
            updateNodeData(id, { ...res, isLoading: false, error: '' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al scrapear';
            updateNodeData(id, { isLoading: false, error: msg });
        }
    };

    const accent = isTikTok ? 'text-cyan-400' : 'text-pink-400';
    const accentBg = isTikTok ? 'bg-cyan-400/10' : 'bg-pink-400/10';

    return (
        <div className="w-80 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl flex flex-col group transition-all hover:border-pink-500/50 hover:shadow-pink-500/10 overflow-hidden">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-pink-500/30 ${accentBg}`}>
                        {isTikTok ? <Music2 className={`w-4 h-4 ${accent}`} /> : <Instagram className={`w-4 h-4 ${accent}`} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <p className="text-[10px] text-pink-400/80 uppercase tracking-widest font-medium">
                            {hasData ? (isTikTok ? 'TikTok' : 'Instagram') : 'Perfil de red social'}
                        </p>
                    </div>
                </div>
                {hasData && (
                    <button
                        onClick={() => updateNodeData(id, { username: '', fullName: '', bio: '', followers: null, following: null, postsCount: null, verified: false, posts: [], error: '' })}
                        title="Limpiar"
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Input */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-2">
                    <input
                        className="nodrag flex-1 px-3 py-2 text-sm rounded-xl border border-border/40 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-muted-foreground/40"
                        placeholder="Pegá la URL del perfil (IG o TikTok)..."
                        value={data.input || ''}
                        onChange={(e) => updateNodeData(id, { input: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleScrape}
                        disabled={isLoading || !(data.input || '').trim()}
                        className="nodrag px-3 rounded-xl bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Scrapear perfil"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                </div>

                {data.error && (
                    <p className="text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                        ⚠️ {data.error}
                    </p>
                )}

                {/* Profile summary */}
                {hasData && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">@{data.username}</span>
                            {data.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                            {data.fullName && <span className="text-xs text-muted-foreground truncate">· {data.fullName}</span>}
                        </div>

                        <div className="flex items-center gap-4 text-[11px]">
                            <span><b>{fmt(data.followers)}</b> <span className="text-muted-foreground">seguidores</span></span>
                            <span><b>{fmt(data.following)}</b> <span className="text-muted-foreground">siguiendo</span></span>
                            <span><b>{fmt(data.postsCount)}</b> <span className="text-muted-foreground">posts</span></span>
                        </div>

                        {data.bio && (
                            <p className="text-[11px] text-foreground/80 whitespace-pre-wrap bg-muted/30 rounded-lg p-2 leading-relaxed">
                                {data.bio}
                            </p>
                        )}

                        {Boolean(data.posts?.length) && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400/80">
                                    Últimos {data.posts!.length} posts
                                </span>
                                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                                    {data.posts!.map((p, i) => (
                                        <div key={i} className="text-[11px] bg-muted/20 border border-border/30 rounded-lg p-2">
                                            <p className="text-foreground/70 line-clamp-2">{p.caption || '(sin texto)'}</p>
                                            <div className="flex items-center gap-3 mt-1 text-muted-foreground/70 text-[10px]">
                                                {p.likes != null && <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {fmt(p.likes)}</span>}
                                                {p.comments != null && <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {fmt(p.comments)}</span>}
                                                {p.views != null && <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {fmt(p.views)}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-pink-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                            Inyectado en el contexto de Berta
                        </div>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-pink-500 !border-2 !border-background" />
            <Handle type="source" id="right" position={Position.Right} className="!w-3 !h-3 !bg-pink-400 !border-2 !border-background" />
        </div>
    );
}
