import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useStore, type MediaNodeData } from '../../store/useStore';
import { Youtube, ExternalLink, Subtitles, Play, Sparkles, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { callOpenRouter } from '../../lib/openrouter';

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function MediaNode({ id, data }: NodeProps<Node<MediaNodeData>>) {
    const updateNodeData = useStore((s) => s.updateNodeData);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        // Al cambiar la URL, limpiar la transcripción anterior
        updateNodeData(id, { url: evt.target.value, transcription: '' });
    };

    const handleGenerateTranscription = async () => {
        if (!data.url?.trim()) return;
        updateNodeData(id, { isLoadingTranscription: true });

        const youtubeId = getYouTubeId(data.url);
        const displayUrl = data.url;

        try {
            // Pedimos al LLM que analice el video dado su URL
            const prompt = `Analizá el siguiente video de YouTube y proporcioná:
1. Un resumen ejecutivo del contenido (2-3 oraciones)
2. Los 5 temas o puntos principales tratados
3. El tono y estilo del video (educativo, entretenimiento, marketing, etc.)
4. Oportunidades de contenido derivado

URL del video: ${displayUrl}
${youtubeId ? `ID de YouTube: ${youtubeId}` : ''}

Respondé en español, de forma estructurada y accionable. Si no podés acceder directamente al video, basate en lo que podés inferir de la URL y proporcioná un análisis preliminar indicando que necesitarías la transcripción real.`;

            const response = await callOpenRouter(
                [
                    { role: 'system', content: 'Sos un experto en análisis de contenido de video y estrategia de medios digitales. Tu objetivo es extraer el máximo valor de cada video para ayudar en estrategias de contenido.' },
                    { role: 'user', content: prompt }
                ],
                'google/gemini-2.0-flash-exp:free'
            );

            const analysis = response.choices?.[0]?.message?.content || 'No se pudo obtener el análisis.';
            updateNodeData(id, {
                transcription: analysis,
                isLoadingTranscription: false,
            });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : 'Error desconocido';
            updateNodeData(id, {
                transcription: `⚠️ Error al analizar: ${errMsg}`,
                isLoadingTranscription: false,
            });
        }
    };

    const handleClearTranscription = () => {
        updateNodeData(id, { transcription: '', url: '' });
    };

    const youtubeId = data.url ? getYouTubeId(data.url) : null;
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
    const hasTranscription = Boolean(data.transcription);
    const isLoading = Boolean(data.isLoadingTranscription);

    return (
        <div className="w-[340px] rounded-[24px] bg-background/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-red-500/20 hover:border-red-500/40">
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !border-[3px] !border-background !bg-red-500 !-top-2 shadow-lg" />

            {/* Thumbnail / Preview */}
            <div className="h-48 bg-black/40 w-full relative group/thumb overflow-hidden">
                {thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-black to-red-900/20 flex flex-col items-center justify-center gap-3">
                        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                            <Youtube className="w-10 h-10 text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.2em]">Esperando URL</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

                {/* Status badge */}
                {hasTranscription && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur text-white text-[10px] font-black shadow-lg">
                        <CheckCircle2 className="w-3 h-3" /> ANALIZADO
                    </div>
                )}
                {isLoading && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur text-white text-[10px] font-black shadow-lg">
                        <Loader2 className="w-3 h-3 animate-spin" /> ANALIZANDO...
                    </div>
                )}

                {/* YouTube play icon overlay */}
                {youtubeId && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl">
                            <Play className="w-6 h-6 text-white fill-white pl-1" />
                        </div>
                    </div>
                )}

                {/* Open in YouTube link */}
                {data.url && (
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/10 text-white backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 border border-white/10"
                        title="Abrir en YouTube"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5 relative">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest">IA Media Engine</span>
                    </div>
                    <h3 className="font-black text-lg text-foreground tracking-tight leading-none group-hover:text-red-500 transition-colors">
                        {data.label}
                    </h3>
                </div>

                {/* URL Input */}
                <div className="space-y-4">
                    <div className="relative group/input">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-focus-within/input:opacity-30 transition-opacity blur" />
                        <input
                            className="nodrag relative w-full pl-4 pr-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-red-500/50 transition-all placeholder:text-muted-foreground/40 font-medium"
                            placeholder="Pegá el enlace de YouTube..."
                            value={data.url || ''}
                            onChange={onChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Action buttons */}
                    {!hasTranscription ? (
                        <button
                            onClick={handleGenerateTranscription}
                            disabled={isLoading || !data.url?.trim()}
                            className="w-full h-12 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2
                                hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95
                                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Analizando video...</>
                            ) : (
                                <><Subtitles className="w-4 h-4" /> Analizar con IA</>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {/* Transcription preview */}
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/20">
                                <p className="text-[11px] text-foreground/70 leading-relaxed whitespace-pre-wrap font-medium">
                                    {data.transcription}
                                </p>
                            </div>
                            {/* Re-analyze button */}
                            <button
                                onClick={handleClearTranscription}
                                className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-muted-foreground font-bold text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Limpiar y reiniciar
                            </button>
                        </div>
                    )}
                </div>

                {/* Connection status */}
                <div className="flex items-center justify-between pt-1">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${hasTranscription ? 'text-green-500' : data.url ? 'text-amber-500' : 'text-muted-foreground/40'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${hasTranscription ? 'bg-green-500 animate-pulse' : data.url ? 'bg-amber-500' : 'bg-muted-foreground/20'}`} />
                        {hasTranscription ? 'Listo para el chat' : data.url ? 'URL detectada' : 'Sin contenido'}
                    </div>
                    {youtubeId && (
                        <span className="text-[9px] font-mono text-muted-foreground/40">{youtubeId}</span>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !border-[3px] !border-background !bg-red-500 !-bottom-2 shadow-lg" />
            <Handle type="source" id="right" position={Position.Right} className="!w-4 !h-4 !border-[3px] !border-background !bg-red-400 shadow-lg" />
        </div>
    );
}
