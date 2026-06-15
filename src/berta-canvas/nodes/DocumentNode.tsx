import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { FileText, BookOpen, CheckCircle2, Upload, Loader2, X } from 'lucide-react';
import { useCanvasStore, type DocumentNodeData } from '../store';
import { useRef, useState } from 'react';
import { extractText, ACCEPTED_DOC_TYPES } from '../lib/documents';

export function DocumentNode({ id, data }: NodeProps<Node<DocumentNodeData>>) {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const hasContent = Boolean(data.content?.trim());
    const charCount = data.content?.length || 0;
    const isParsing = Boolean(data.isParsing);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        updateNodeData(id, { isParsing: true, fileName: '', fileType: '' });
        const names: string[] = [];
        const chunks: string[] = [];
        try {
            for (const file of Array.from(files)) {
                try {
                    const text = await extractText(file);
                    if (text) {
                        chunks.push(`### ${file.name}\n${text}`);
                        names.push(file.name);
                    } else {
                        chunks.push(`### ${file.name}\n(No se pudo extraer texto)`);
                    }
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Error al procesar';
                    chunks.push(`### ${file.name}\n⚠️ ${msg}`);
                }
            }
            const existing = data.content?.trim() ? data.content.trim() + '\n\n---\n\n' : '';
            updateNodeData(id, {
                content: existing + chunks.join('\n\n---\n\n'),
                fileName: names.join(', '),
                fileType: files.length > 1 ? `${files.length} archivos` : files[0].type || 'archivo',
                isParsing: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            updateNodeData(id, { isParsing: false });
            // Mostramos el error inline en el contenido
            updateNodeData(id, { content: (data.content || '') + `\n\n⚠️ ${msg}` });
        }
    };

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
                            {hasContent ? 'Contenido activo' : 'Documentos y reglas'}
                        </p>
                    </div>
                </div>
                {hasContent && (
                    <button
                        onClick={() => updateNodeData(id, { content: '', fileName: '', fileType: '' })}
                        title="Limpiar"
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
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
                {/* Dropzone / Upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_DOC_TYPES}
                    className="hidden"
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                    disabled={isParsing}
                    className={`nodrag w-full rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 py-4 transition-all ${
                        dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-border/50 bg-muted/20 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                    } disabled:opacity-50`}
                >
                    {isParsing ? (
                        <>
                            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                            <span className="text-[10px] text-indigo-400 font-medium">Procesando documento...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] text-muted-foreground font-medium">
                                Soltá o subí PDF, Word, texto o imagen
                            </span>
                        </>
                    )}
                </button>

                {data.fileName && (
                    <span className="text-[10px] text-indigo-400/80 truncate" title={data.fileName}>
                        📎 {data.fileName}
                    </span>
                )}

                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNodeData(id, { content: e.target.value })}
                    placeholder="O escribí acá las reglas de tu marca, tono, restricciones... El Agente IA lo usa automáticamente."
                    className="nodrag w-full h-28 bg-muted/40 border border-border/30 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-muted-foreground/50 leading-relaxed"
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
