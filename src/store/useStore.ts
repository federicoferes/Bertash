import { create } from 'zustand';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Connection,
} from '@xyflow/react';

// ─── Model settings ─────────────────────────────────────────────────────────
export type ModelSettings = {
    temperature: number;   // 0.0 – 1.0
    maxTokens: number;     // 512 – 8192
    topP: number;          // 0.0 – 1.0
};

// ─── Node data shapes ────────────────────────────────────────────────────────
export type MediaNodeData = {
    label: string;
    url?: string;
    transcription?: string;
    isLoadingTranscription?: boolean;
};

export type AIChatNodeData = {
    label: string;
    model?: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export type DocumentNodeData = {
    label: string;
    content?: string;
};

// ─── Store ───────────────────────────────────────────────────────────────────
export type AppState = {
    nodes: Node[];
    edges: Edge[];
    modelSettings: ModelSettings;

    // ReactFlow handlers
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Node mutations
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    updateNodeData: (nodeId: string, data: object) => void;

    // Settings mutations
    setTemperature: (v: number) => void;
    setMaxTokens: (v: number) => void;
    setTopP: (v: number) => void;

    // Computed context helpers (read from current nodes)
    getBrandRules: () => string;
    getMediaContext: () => string;
};

const initialNodes: Node[] = [
    {
        id: 'media-1',
        type: 'media',
        position: { x: 80, y: 60 },
        data: { label: 'Video Principal', url: '', transcription: '' } satisfies MediaNodeData,
    },
    {
        id: 'media-2',
        type: 'media',
        position: { x: 80, y: 420 },
        data: { label: 'Video de Referencia', url: '', transcription: '' } satisfies MediaNodeData,
    },
    {
        id: 'doc-1',
        type: 'document',
        position: { x: 620, y: 60 },
        data: { label: 'Manual de Marca', content: '' } satisfies DocumentNodeData,
    },
    {
        id: 'chat-1',
        type: 'aiChat',
        position: { x: 330, y: 220 },
        data: {
            label: 'Agente IA',
            messages: [
                { role: 'assistant', content: '¡Hola! Soy Bertash. Pegá URLs de YouTube en los nodos de video y escribí tus reglas de marca. Luego preguntame lo que necesites sobre tu contenido.' }
            ]
        } satisfies AIChatNodeData,
    },
];

const initialEdges: Edge[] = [
    { id: 'e-m1-chat', source: 'media-1', target: 'chat-1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { id: 'e-m2-chat', source: 'media-2', target: 'chat-1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    { id: 'e-doc-chat', source: 'doc-1', target: 'chat-1', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
];

export const useStore = create<AppState>((set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    modelSettings: {
        temperature: 0.72,
        maxTokens: 4096,
        topP: 0.95,
    },

    // ── ReactFlow handlers ──
    onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
    onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
    onConnect: (connection: Connection) => set({ edges: addEdge(connection, get().edges) }),

    // ── Mutations ──
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    updateNodeData: (nodeId, data) =>
        set({
            nodes: get().nodes.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
            ),
        }),

    setTemperature: (v) => set((s) => ({ modelSettings: { ...s.modelSettings, temperature: v } })),
    setMaxTokens: (v) => set((s) => ({ modelSettings: { ...s.modelSettings, maxTokens: v } })),
    setTopP: (v) => set((s) => ({ modelSettings: { ...s.modelSettings, topP: v } })),

    // ── Context helpers: extraen contenido de los nodos ──
    getBrandRules: () => {
        const docNodes = get().nodes.filter((n) => n.type === 'document');
        const rules = docNodes
            .map((n) => (n.data as DocumentNodeData).content)
            .filter(Boolean)
            .join('\n\n---\n\n');
        return rules;
    },

    getMediaContext: () => {
        const mediaNodes = get().nodes.filter((n) => n.type === 'media');
        const parts = mediaNodes
            .map((n) => {
                const d = n.data as MediaNodeData;
                if (!d.url && !d.transcription) return null;
                let part = `📹 **${d.label}**`;
                if (d.url) part += `\nURL: ${d.url}`;
                if (d.transcription) part += `\nAnálisis/Transcripción:\n${d.transcription}`;
                return part;
            })
            .filter(Boolean);
        return parts.join('\n\n');
    },
}));
