import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Bot, Sparkles, FileText, Send, Database, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useStore } from '../../store/useStore';
import { useState } from 'react';
import { callOpenRouter } from '../../lib/openrouter';

export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export type AIChatNodeData = {
    label: string;
    model?: string;
    messages?: Message[];
};

const MODELS = [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Free', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export function AIChatNode({ id, data }: NodeProps<Node<AIChatNodeData>>) {
    const updateNodeData = useStore((s) => s.updateNodeData);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const selectedModel = data.model || MODELS[0].id;
    const modelInfo = MODELS.find(m => m.id === selectedModel) || MODELS[0];

    const messages = data.messages || [
        { role: 'assistant', content: '¡Hola! Soy Bertash. Conectá videos de YouTube para que pueda analizarlos por vos.' }
    ];

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
            const response = await callOpenRouter(newMessages, selectedModel);
            const assistantMessage = response.choices?.[0]?.message?.content || "No recibí respuesta.";
            
            updateNodeData(id, {
                messages: [
                    ...newMessages,
                    { role: 'assistant', content: assistantMessage }
                ]
            });
        } catch (error: any) {
            console.error('Error calling OpenRouter:', error);
            updateNodeData(id, {
                messages: [
                    ...newMessages,
                    { role: 'assistant', content: `⚠️ Error: ${error.message}. Asegurate de tener la API Key configurada en el archivo .env.` }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateNodeData(id, { model: e.target.value });
    };

    return (
        <div className="w-96 rounded-2xl bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl flex flex-col transition-all overflow-hidden group hover:shadow-primary/10">
            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !border-4 !border-background !bg-primary" />

            {/* Premium Header */}
            <div className={`p-4 border-b border-primary/10 flex items-center justify-between bg-gradient-to-r from-primary/5 via-transparent to-transparent`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${modelInfo.bg} ${modelInfo.color} ${isLoading ? 'animate-pulse' : ''} shadow-inner transition-all`}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">{data.label}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {isLoading ? 'Procesando...' : 'Conectado'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Model Selector styled as a pill */}
                <div className="relative group/select">
                    <select 
                        value={selectedModel}
                        onChange={handleModelChange}
                        disabled={isLoading}
                        className="nodrag appearance-none bg-muted/50 border border-border/50 rounded-full py-1.5 pl-3 pr-8 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted transition-all text-foreground/80 uppercase tracking-tighter disabled:opacity-50"
                    >
                        {MODELS.map(model => (
                            <option key={model.id} value={model.id} className="bg-background text-foreground">
                                {model.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover/select:text-primary transition-colors">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Chat History with stylized backgrounds */}
            <div className="p-4 flex flex-col gap-4 min-h-[250px] max-h-[350px] overflow-y-auto bg-dots-slate-200/40 dark:bg-dots-slate-800/40 scrollbar-thin scrollbar-thumb-primary/20">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                            {msg.role === 'assistant' ? (
                                <>
                                    <Sparkles className="w-3 h-3 text-primary animate-sparkle" />
                                    <span className="text-[10px] font-bold text-primary tracking-tight">BERTASH AI</span>
                                </>
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground tracking-tight">VOS</span>
                            )}
                        </div>
                        <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted/80 backdrop-blur-md border border-border/50 text-foreground rounded-tl-none ring-1 ring-white/10'
                        } max-w-[85%] whitespace-pre-wrap font-medium`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex flex-col items-start animate-pulse">
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                            <Loader2 className="w-3 h-3 text-primary animate-spin" />
                            <span className="text-[10px] font-bold text-primary tracking-tight">BERTASH ESTÁ PENSANDO...</span>
                        </div>
                        <div className="p-3 rounded-2xl text-[13px] bg-muted/40 border border-border/50 text-muted-foreground rounded-tl-none h-12 w-24 flex items-center justify-center">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 py-2 border-t border-primary/5 flex gap-2 overflow-x-auto bg-muted/5 no-scrollbar">
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline" onClick={() => handleSendMessage('Resumí los videos.')}>
                    <FileText className="w-3 h-3 mr-1 text-primary" /> RESUMIR
                </Button>
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline" onClick={() => handleSendMessage('Dame insights clave.')}>
                    <Sparkles className="w-3 h-3 mr-1 text-primary" /> INSIGHTS
                </Button>
                <Button className="h-7 text-[10px] font-bold flex-none px-3 rounded-full border-primary/10 hover:bg-primary/5" variant="outline" onClick={() => handleSendMessage('¿Qué fuentes están conectadas?')}>
                    <Database className="w-3 h-3 mr-1 text-primary" /> FUENTES
                </Button>
            </div>

            {/* Modern Input Field */}
            <div className="p-4 border-t border-primary/10 bg-muted/10 backdrop-blur-sm">
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        placeholder={isLoading ? "Bertash está pensando..." : `Preguntar a ${modelInfo.name}...`}
                        disabled={isLoading}
                        className="nodrag w-full bg-background border border-primary/10 rounded-2xl py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-inner transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/40 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
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
