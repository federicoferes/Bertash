import { Handle, Position } from '@xyflow/react';
import { FileText, Maximize2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function DocumentNode({ id, data }: { id: string, data: { label: string, content: string } }) {
    const updateNodeData = useStore((state) => state.updateNodeData);

    return (
        <div className="w-72 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl flex flex-col group transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10 overflow-hidden">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <FileText className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Contexto</p>
                    </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Maximize2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-3">
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNodeData(id, { content: e.target.value })}
                    placeholder="Escribe instrucciones, reglas o contexto aquí..."
                    className="w-full h-32 bg-muted/40 border border-border/30 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                />
                
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Listo para procesar
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/50">
                        {data.content?.length || 0} chars
                    </span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
            <Handle type="target" id="left" position={Position.Left} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
        </div>
    );
}
