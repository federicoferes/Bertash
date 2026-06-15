import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Bot, Sparkles, FileText, Send, Database, ShieldCheck, Loader2, Link, Book, Eye, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useCanvasStore } from '../store';
import { useState, useRef, useEffect } from 'react';
import { callOpenRouter, type ChatMessage } from '../lib/openrouter';
import { CHAT_MODELS, CHAT_MODELS_BY_ID, DEFAULT_CHAT_MODEL } from '../config/chatModels';

export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export type AIChatNodeData = {
    label: string;
    model?: string;
    messages?: Message[];
};

const MODELS = CHAT_MODELS;

export function AIChatNode({ id, data }: NodeProps<Node<AIChatNodeData>>) {
    const updateNodeData = useCanvasStore((s) => s.updateNodeData);
    const getBrandRules = useCanvasStore((s) => s.getBrandRules);
    const getMediaContext = useCanvasStore((s) => s.getMediaContext);
    const getSocialContext = useCanvasStore((s) => s.getSocialContext);
    const modelSettings = useCanvasStore((s) => s.modelSettings);

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedModel = data.model || DEFAULT_CHAT_MODEL;
    const modelInfo = CHAT_MODELS_BY_ID[selectedModel] || MODELS[0];
    const messages: Message[] = data.messages || [
        { role: 'assistant', content: '¡Hola! Soy Bertash. Conectá videos de YouTube y escribí tus reglas de marca. Luego preguntame lo que necesites.' }
    ];

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isLoading]);

    const buildSystemPrompt = (): string => {
        const brandRules = getBrandRules();
        const mediaContext = getMediaContext();
        const socialContext = getSocialContext();

        let system = `Sos Bertash, un asistente experto en estrategia de contenido digital, análisis de videos y marketing en redes sociales. Respondé siempre en español, de forma clara, directa y accionable.`;

        if (brandRules) {
            system += `\n\n## 📋 Documentos y reglas de marca\n${brandRules}`;
        }

        if (mediaContext) {
            system += `\n\n## 📹 Videos conectados\n${mediaContext}`;
        }

        if (socialContext) {
            system += `\n\n## 📱 Perfiles de redes sociales\n${socialContext}`;
        }

        if (!brandRules && !mediaContext && !socialContext) {
            system += `\n\nTodavía no hay contexto conectado. Podés subir documentos (PDF, Word, imágenes), pegar perfiles de Instagram/TikTok, agregar URLs de YouTube o escribir reglas de marca en los nodos del canvas.`;
        }

        return system;
    };

    const handleSendMessage = async (text: string = inputValue) => {
        const messageToSend = text.trim();
        if (!messageToSend || isLoading) return;

        const newMessages: Message[] = [
            ...messages,
            { role: 'user', content: messageToSend }
        ];

        updateNodeData(id, { messages: newMessages });
        setInputValue('');
        setIsLoading(true);

        try {
            // Construir el array de mensajes para la API: system + historial
            const systemPrompt = buildSystemPrompt();
            const apiMessages: ChatMessage[] = [
                { role: 'system', content: systemPrompt },
                ...newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            ];

            const response = await callOpenRouter(apiMessages, selectedModel, {
                temperature: modelSettings.temperature,
                max_tokens: modelSettings.maxTokens,
                top_p: modelSettings.topP,
            });
            const assistantMessage = response.choices?.[0]?.message?.content || 'No recibí respuesta.';

            updateNodeData(id, {
                messages: [
                    ...newMessages,
                    { role: 'assistant', content: assistantMessage }
                ]
            });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : 'Error desconocido';
            updateNodeData(id, {
                messages: [
                    ...newMessages,
                    { role: 'assistant', content: `⚠️ **Error:** ${errMsg}` }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateNodeData(id, { model: e.target.value });
    };

    const hasContext = getBrandRules() || getMediaContext() || getSocialContext();

    // Modelos agrupados por proveedor para el dropdown
    const providers = ['Anthropic', 'Google', 'OpenAI', 'Gratis'] as const;

    return (
        <div className="w-96 rounded-2xl bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl flex flex-col transition-all overflow-hidden group hover:shadow-primary/10">
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !border-4 !border-background !bg-primary" />
            <Handle type="target" id="left" position={Position.Left} className="!w-4 !h-4 !border-4 !border-background !bg-indigo-400" />

            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${modelInfo.bg} ${modelInfo.color} ${isLoading ? 'animate-pulse' : ''} shadow-inner transition-all`}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {isLoading ? 'Procesando...' : 'Conectado'}
                            </span>
                            {/* Context badges */}
                            {getBrandRules() && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
                                    <Book className="w-2.5 h-2.5" /> Marca
                                </span>
                            )}
                            {getMediaContext() && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-bold">
                                    <Link className="w-2.5 h-2.5" /> Videos
                                </span>
                            )}
                            {getSocialContext() && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[9px] font-bold">
                                    <Share2 className="w-2.5 h-2.5" /> Redes
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Model selector */}
                <div className="flex items-center gap-1.5">
                    {modelInfo.vision && (
                        <span title="Acepta imágenes" className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                            <Eye className="w-2.5 h-2.5" /> visión
                        </span>
                    )}
                    <div className="relative group/select">
                        <select
                            value={selectedModel}
                            onChange={handleModelChange}
                            disabled={isLoading}
                            className="nodrag appearance-none bg-muted/50 border border-border/50 rounded-full py-1.5 pl-3 pr-8 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted transition-all text-foreground/80 uppercase tracking-tighter disabled:opacity-50"
                        >
                            {providers.map(prov => {
                                const group = MODELS.filter(m => m.provider === prov);
                                if (group.length === 0) return null;
                                return (
                                    <optgroup key={prov} label={prov} className="bg-background text-foreground">
                                        {group.map(model => (
                                            <option key={model.id} value={model.id} className="bg-background text-foreground">
                                                {model.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Context indicator bar */}
            {!hasContext && (
                <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] text-amber-500/70 font-medium">
                        Sin contexto. Subí documentos, pegá perfiles o conectá videos para mejores respuestas.
                    </span>
                </div>
            )}

            {/* Chat history */}
            <div className="p-4 flex flex-col gap-4 min-h-[250px] max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                            {msg.role === 'assistant' ? (
                                <>
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-bold text-primary tracking-tight">BERTASH AI</span>
                                </>
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground tracking-tight">VOS</span>
                            )}
                        </div>
                        <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted/80 backdrop-blur-md border border-border/50 text-foreground rounded-tl-none'
                            } max-w-[85%] whitespace-pre-wrap font-medium`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                            <Loader2 className="w-3 h-3 text-primary animate-spin" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Pensando...</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 rounded-tl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className="px-4 py-2 border-t border-primary/5 flex gap-2 overflow-x-auto bg-muted/5 no-scrollbar">
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline"
                    onClick={() => handleSendMessage('Resumí el contenido de los videos conectados y dame los puntos clave.')}>
                    <FileText className="w-3 h-3 mr-1 text-primary" /> RESUMIR
                </Button>
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline"
                    onClick={() => handleSendMessage('Dame 5 insights accionables para mejorar mi estrategia de contenido basándote en los videos conectados.')}>
                    <Sparkles className="w-3 h-3 mr-1 text-primary" /> INSIGHTS
                </Button>
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline"
                    onClick={() => handleSendMessage('¿Qué videos y reglas de marca tenés actualmente conectadas?')}>
                    <Database className="w-3 h-3 mr-1 text-primary" /> FUENTES
                </Button>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-primary/10 bg-muted/10 backdrop-blur-sm">
                {/* Model settings summary */}
                <div className="flex items-center gap-3 mb-3 px-1">
                    <span className="text-[9px] text-muted-foreground/50 font-mono">
                        T:{modelSettings.temperature.toFixed(2)} · TK:{modelSettings.maxTokens} · P:{modelSettings.topP.toFixed(2)}
                    </span>
                </div>
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        placeholder={isLoading ? 'Bertash está pensando...' : `Preguntar a ${modelInfo.name}...`}
                        disabled={isLoading}
                        className="nodrag w-full bg-background border border-primary/10 rounded-2xl py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-inner transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[9px] text-muted-foreground font-bold tracking-widest opacity-40">
                    <ShieldCheck className="w-3 h-3" />
                    BERTASH SECURE ENGINE
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !border-4 !border-background !bg-primary" />
        </div>
    );
}
