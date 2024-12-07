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
  type?: 'api' | 'response';
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
    async (params: Connection) => {
      // Get source and target nodes
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      if (sourceNode && targetNode) {
        // Add the connection
        setEdges((eds) => addEdge(params, eds));

        // If the target is an API node and source has output, trigger API call
        if (targetNode.data.type === 'api' && sourceNode.data.output) {
          try {
            const response = await fetch("/api/proxy", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: targetNode.data.deploymentUrl,
                method: targetNode.data.method,
                data: { input: sourceNode.data.output },
              }),
            });

            const data = await response.json();
            
            // Update the API node with the output
            setNodes(nds => 
              nds.map(node => 
                node.id === targetNode.id 
                  ? { ...node, data: { ...node.data, output: data, outputType: typeof data === "object" ? "json" : typeof data } }
                  : node
              )
            );

            // Create a response node
            const responseNode: Node = {
              id: `response-${Date.now()}`,
              type: 'response',
              position: {
                x: targetNode.position.x + 200,
                y: targetNode.position.y,
              },
              data: {
                label: 'Response',
                output: data,
                outputType: typeof data === "object" ? "json" : typeof data,
              },
            };

            // Add response node
            setNodes(nds => [...nds, responseNode]);

            // Connect API node to response node
            setEdges(eds => [
              ...eds,
              {
                id: `${targetNode.id}-${responseNode.id}`,
                source: targetNode.id,
                target: responseNode.id,
              },
            ]);
          } catch (error) {
            console.error("Error calling API:", error);
          }
        }
      }
    },
    [nodes, setNodes, setEdges]
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
