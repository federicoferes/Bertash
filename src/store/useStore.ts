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

export type AppState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    updateNodeData: (nodeId: string, data: object) => void;
};

export const useStore = create<AppState>((set, get) => ({
    nodes: [
        { id: '1', type: 'media', position: { x: 250, y: 100 }, data: { label: 'Video de YouTube', url: '' } },
        { id: '2', type: 'aiChat', position: { x: 250, y: 500 }, data: { label: 'Chat con IA', messages: [] } },
        { id: '3', type: 'document', position: { x: 600, y: 100 }, data: { label: 'Reglas de Marca', content: '' } },
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
    ],
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes) => {
        set({ nodes });
    },
    setEdges: (edges) => {
        set({ edges });
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node],
        });
    },
    updateNodeData: (nodeId, data) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...data } };
                }
                return node;
            }),
        });
    },
}));
