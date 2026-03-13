import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { FileText, Maximize2, BookOpen, CheckCircle2 } from 'lucide-react';
import { useStore, type DocumentNodeData } from '../../store/useStore';

export function DocumentNode({ id, data }: NodeProps<Node<DocumentNodeData>>) {
    const updateNodeData = useStore((state) => state.updateNodeData);

    const hasContent = Boolean(data.content?.trim());
    const charCount = data.content?.length || 0;

    return (
        <div className="w-72 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl flex flex-col group transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10 overflow-hidden">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
            <Handle type="target" id="left" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${hasContent ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                        {hasContent ? (
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                        ) : (
                            <FileText className="w-4 h-4 text-indigo-500" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <p className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-medium">
                            {hasContent ? 'Reglas activas' : 'Reglas de Marca'}
                        </p>
                    </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <Maximize2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Context injection indicator */}
            {hasContent && (
                <div className="px-4 py-2 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] text-indigo-400/80 font-medium">
                        Inyectado en el system prompt del Agente IA
                    </span>
                </div>
            )}

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-3">
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNodeData(id, { content: e.target.value })}
                    placeholder="Escribí las reglas de tu marca, estilo de comunicación, tono, restricciones, etc. El Agente IA las usará automáticamente..."
                    className="nodrag w-full h-36 bg-muted/40 border border-border/30 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                />

                <div className="flex items-center justify-between">
                    <span className={`text-[10px] flex items-center gap-1.5 ${hasContent ? 'text-indigo-400' : 'text-muted-foreground'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${hasContent ? 'bg-indigo-400 animate-pulse' : 'bg-muted-foreground/40'}`} />
                        {hasContent ? 'Activo en el chat' : 'Esperando contenido'}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/50">
                        {charCount > 0 ? `${charCount} chars` : '—'}
                    </span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
            <Handle type="source" id="right" position={Position.Right} className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-background" />
        </div>
    );
}
