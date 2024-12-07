import { useCallback, useState } from 'react';
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';

interface ApiNodeData {
  label: string;
  deploymentUrl?: string;
  containerId?: string;
  type: 'api';
}

interface NodeData {
  label: string;
  type?: 'api';
  deploymentUrl?: string;
  containerId?: string;
}

export function useFlow(defaultNodes: Node[], defaultEdges: Edge[]) {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    []
  );

  const addNode = useCallback(async (nodeData?: Partial<NodeData>) => {
    const newNode: Node<NodeData> = {
      id: `${nodes.length + 1}`,
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 300 
      },
      data: { 
        label: nodeData?.label || `Node ${nodes.length + 1}`,
        type: nodeData?.type,
        deploymentUrl: nodeData?.deploymentUrl,
        containerId: nodeData?.containerId,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [nodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  };
}
