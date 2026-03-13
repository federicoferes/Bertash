import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { useStore } from '../../store/useStore';
import { Youtube, ExternalLink, Subtitles, Play, Sparkles } from 'lucide-react';

export type MediaNodeData = {
    label: string;
    url?: string;
};

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function MediaNode({ id, data }: NodeProps<Node<MediaNodeData>>) {
    const updateNodeData = useStore((s) => s.updateNodeData);

    const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(id, { url: evt.target.value });
    };

    const youtubeId = data.url ? getYouTubeId(data.url) : null;
    const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;

    return (
        <div className="w-[340px] rounded-[24px] bg-background/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-red-500/20 hover:border-red-500/40">
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !border-[3px] !border-background !bg-red-500 !-top-2 shadow-lg" />

            {/* Cinematic Header */}
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
                        <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.2em]">Esperando Señal</span>
                    </div>
                )}
                
                {/* Overlay Effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-red-500/5 mix-blend-overlay group-hover:bg-red-500/10 transition-colors" />

                {/* Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl p-0.5">
                        <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center pl-1">
                            <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>
                </div>
                
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

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black shadow-xl uppercase tracking-widest border border-white/20">
                        HD 4K
                    </div>
                </div>
            </div>

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
                
                <div className="space-y-4">
                    <div className="relative group/input">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-focus-within/input:opacity-30 transition-opacity blur" />
                        <input
                            className="nodrag relative w-full pl-4 pr-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-red-500/50 transition-all placeholder:text-muted-foreground/40 font-medium"
                            placeholder="Pega el enlace de YouTube..."
                            value={data.url || ''}
                            onChange={onChange}
                        />
                    </div>

                    <button className="w-full h-12 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95 group/btn">
                        <Subtitles className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                        Generar Transcripción
                    </button>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !border-[3px] !border-background !bg-red-500 !-bottom-2 shadow-lg" />
        </div>
    );
}
