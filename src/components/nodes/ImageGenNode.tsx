import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ImagePlus, Loader2, Sparkles, Download, RotateCcw, DollarSign } from 'lucide-react';
import { useStore, type ImageGenNodeData } from '../../store/useStore';
import { IMAGE_MODELS, IMAGE_MODELS_BY_SLUG, DEFAULT_IMAGE_MODEL, defaultParamsFor } from '../../config/imageModels';
import { generateImage } from '../../lib/segmind';

export function ImageGenNode({ id, data }: NodeProps<Node<ImageGenNodeData>>) {
    const updateNodeData = useStore((s) => s.updateNodeData);

    const slug = data.modelSlug || DEFAULT_IMAGE_MODEL;
    const model = IMAGE_MODELS_BY_SLUG[slug] || IMAGE_MODELS[0];
    const params = data.params || defaultParamsFor(slug);
    const isLoading = Boolean(data.isLoading);
    const prompt = data.prompt ?? (params.prompt as string) ?? '';

    const setParam = (key: string, value: unknown) => {
        updateNodeData(id, { params: { ...params, [key]: value } });
    };

    const handleModelChange = (newSlug: string) => {
        updateNodeData(id, { modelSlug: newSlug, params: defaultParamsFor(newSlug), resultUrl: '', error: '' });
    };

    const handleGenerate = async () => {
        const p = (data.prompt ?? (params.prompt as string) ?? '').trim();
        if (!p || isLoading) return;
        updateNodeData(id, { isLoading: true, error: '' });
        try {
            const allParams = { ...params, prompt: p };
            const url = await generateImage(slug, allParams);
            updateNodeData(id, { resultUrl: url, isLoading: false, error: '' });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al generar';
            updateNodeData(id, { isLoading: false, error: msg });
        }
    };

    return (
        <div className="w-80 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl flex flex-col group transition-all hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10 overflow-hidden">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-fuchsia-500 !border-2 !border-background" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10">
                        <ImagePlus className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <p className="text-[10px] text-fuchsia-400/80 uppercase tracking-widest font-medium flex items-center gap-1">
                            <DollarSign className="w-2.5 h-2.5" />~${model.avgCost.toFixed(3)} / imagen
                        </p>
                    </div>
                </div>
                <select
                    value={slug}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={isLoading}
                    className="nodrag bg-muted/50 border border-border/50 rounded-full py-1 px-2 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 cursor-pointer disabled:opacity-50 max-w-[120px]"
                >
                    {IMAGE_MODELS.map((m) => (
                        <option key={m.slug} value={m.slug} className="bg-background text-foreground">{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Result preview */}
            {data.resultUrl && (
                <div className="relative bg-black/30">
                    <img src={data.resultUrl} alt="Generación" className="w-full max-h-64 object-contain" />
                    <a
                        href={data.resultUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white backdrop-blur hover:bg-fuchsia-600 transition-all"
                        title="Descargar"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </a>
                </div>
            )}

            {/* Form */}
            <div className="p-4 flex flex-col gap-3">
                <textarea
                    value={prompt}
                    onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
                    placeholder="Describí la imagen que querés generar..."
                    className="nodrag w-full h-20 bg-muted/40 border border-border/30 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 transition-all placeholder:text-muted-foreground/50"
                    disabled={isLoading}
                />

                {/* Extra params (no incluye el prompt, que ya tiene su textarea) */}
                {model.params.filter((p) => p.key !== 'prompt').map((p) => (
                    <div key={p.key} className="flex items-center gap-2">
                        <label className="text-[10px] text-muted-foreground w-20 shrink-0">{p.label}</label>
                        {p.type === 'select' ? (
                            <select
                                value={String(params[p.key] ?? p.default ?? '')}
                                onChange={(e) => setParam(p.key, e.target.value)}
                                disabled={isLoading}
                                className="nodrag flex-1 bg-muted/40 border border-border/30 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30 disabled:opacity-50"
                            >
                                {p.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ) : p.type === 'number' ? (
                            <input
                                type="number"
                                min={p.min}
                                max={p.max}
                                value={Number(params[p.key] ?? p.default ?? 0)}
                                onChange={(e) => setParam(p.key, Number(e.target.value))}
                                disabled={isLoading}
                                className="nodrag flex-1 bg-muted/40 border border-border/30 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30 disabled:opacity-50"
                            />
                        ) : (
                            <input
                                type="text"
                                value={String(params[p.key] ?? '')}
                                onChange={(e) => setParam(p.key, e.target.value)}
                                disabled={isLoading}
                                placeholder={p.label}
                                className="nodrag flex-1 bg-muted/40 border border-border/30 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30 disabled:opacity-50"
                            />
                        )}
                    </div>
                ))}

                {data.error && (
                    <p className="text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-2">⚠️ {data.error}</p>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="nodrag w-full h-10 rounded-xl bg-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-fuchsia-600 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                    ) : data.resultUrl ? (
                        <><RotateCcw className="w-4 h-4" /> Regenerar</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Generar imagen</>
                    )}
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-fuchsia-500 !border-2 !border-background" />
        </div>
    );
}
