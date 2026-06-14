import { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Panel,
    type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { AIChatNode } from './nodes/AIChatNode';
import { MediaNode } from './nodes/MediaNode';
import { DocumentNode } from './nodes/DocumentNode';
import { SocialProfileNode } from './nodes/SocialProfileNode';
import { ImageGenNode } from './nodes/ImageGenNode';
import { DEFAULT_IMAGE_MODEL, defaultParamsFor } from '../config/imageModels';
import { Plus, LayoutGrid, Zap } from 'lucide-react';

const nodeTypes = {
    aiChat: AIChatNode,
    media: MediaNode,
    document: DocumentNode,
    social: SocialProfileNode,
    imageGen: ImageGenNode,
};

let nodeIdCounter = 100;

export const NetworkGraph = () => {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setNodes } = useStore();
    const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

    const handleAutoLayout = useCallback(() => {
        // Simple auto-layout: distribute nodes in a grid
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const SPACING_X = 460;
        const SPACING_Y = 350;
        const OFFSET_X = 80;
        const OFFSET_Y = 80;

        const rePositioned = nodes.map((node, i) => ({
            ...node,
            position: {
                x: OFFSET_X + (i % cols) * SPACING_X,
                y: OFFSET_Y + Math.floor(i / cols) * SPACING_Y,
            },
        }));
        setNodes(rePositioned);
    }, [nodes, setNodes]);

    const addMediaNode = useCallback(() => {
        const id = `media-${++nodeIdCounter}`;
        addNode({
            id,
            type: 'media',
            position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
            data: { label: 'Nuevo Video', url: '', transcription: '' },
        });
    }, [addNode]);

    const addDocNode = useCallback(() => {
        const id = `doc-${++nodeIdCounter}`;
        addNode({
            id,
            type: 'document',
            position: { x: 500 + Math.random() * 200, y: 80 + Math.random() * 200 },
            data: { label: 'Nuevo Documento', content: '' },
        });
    }, [addNode]);

    const addChatNode = useCallback(() => {
        const id = `chat-${++nodeIdCounter}`;
        addNode({
            id,
            type: 'aiChat',
            position: { x: 300 + Math.random() * 200, y: 250 + Math.random() * 200 },
            data: {
                label: 'Nuevo Agente',
                messages: [{ role: 'assistant', content: '¡Hola! Soy un nuevo agente Bertash. ¿En qué te ayudo?' }],
            },
        });
    }, [addNode]);

    const addSocialNode = useCallback(() => {
        const id = `social-${++nodeIdCounter}`;
        addNode({
            id,
            type: 'social',
            position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
            data: { label: 'Perfil Social', input: '', posts: [] },
        });
    }, [addNode]);

    const addImageGenNode = useCallback(() => {
        const id = `img-${++nodeIdCounter}`;
        addNode({
            id,
            type: 'imageGen',
            position: { x: 500 + Math.random() * 200, y: 250 + Math.random() * 200 },
            data: { label: 'Generar Imagen', modelSlug: DEFAULT_IMAGE_MODEL, params: defaultParamsFor(DEFAULT_IMAGE_MODEL) },
        });
    }, [addNode]);

    return (
        <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/5">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onInit={(instance) => { rfInstanceRef.current = instance; }}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                deleteKeyCode="Delete"
                className="bg-background"
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color="rgba(255,255,255,0.06)"
                />
                <Controls className="!border-white/10 !bg-background/80 !backdrop-blur !rounded-2xl !shadow-xl" />
                <MiniMap
                    className="!border-white/5 !bg-background/80 !backdrop-blur !rounded-2xl"
                    nodeColor={(node) => {
                        if (node.type === 'aiChat') return '#6366f1';
                        if (node.type === 'media') return '#ef4444';
                        if (node.type === 'social') return '#ec4899';
                        if (node.type === 'imageGen') return '#d946ef';
                        return '#8b5cf6';
                    }}
                    maskColor="rgba(0,0,0,0.5)"
                />

                {/* Top-right action panel */}
                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={addMediaNode}
                        className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Video
                    </button>
                    <button
                        onClick={addDocNode}
                        className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Doc
                    </button>
                    <button
                        onClick={addSocialNode}
                        className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Perfil
                    </button>
                    <button
                        onClick={addImageGenNode}
                        className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-fuchsia-400 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 transition-all shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Imagen
                    </button>
                    <button
                        onClick={addChatNode}
                        className="flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Agente
                    </button>
                    <button
                        onClick={handleAutoLayout}
                        className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur border border-white/10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-white/5 transition-all shadow-lg"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> Auto-Layout
                    </button>
                    <button
                        onClick={() => rfInstanceRef.current?.fitView({ padding: 0.2 })}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Zap className="w-3.5 h-3.5" /> Deploy Network
                    </button>
                </Panel>

                {/* Bottom-left hint */}
                <Panel position="bottom-left">
                    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-mono bg-background/60 backdrop-blur border border-white/5 rounded-xl px-3 py-2">
                        <span className="text-foreground/50">🔌 Arrastrá los nodos para conectarlos</span>
                        <span className="text-foreground/50">🗑️ Seleccioná + Delete para eliminar</span>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};
