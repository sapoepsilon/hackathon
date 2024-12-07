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

interface NodeData {
  label: string;
  type?: 'api';
  deploymentUrl?: string;
  containerId?: string;
  method?: string;
  output?: unknown;  // Store API output
  inputType?: string;  // Type of input this node accepts
  outputType?: string;  // Type of output this node produces
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
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      // Check if the output type matches the input type
      if (sourceNode?.data.outputType && targetNode?.data.inputType &&
          sourceNode.data.outputType === targetNode.data.inputType) {
        setEdges((eds) => addEdge(params, eds));
      } else {
        console.warn('Connection invalid: input/output types do not match');
      }
    },
    [nodes]
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
        method: nodeData?.method,
        output: nodeData?.output,
        inputType: nodeData?.inputType,
        outputType: nodeData?.outputType
      },
    };
    setNodes((nds: unknown) => [...nds, newNode]);
    return newNode;
  }, [nodes]);

  const updateNode = useCallback((nodeId: string, updates: Partial<NodeData>) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
    updateNode,
  };
}
