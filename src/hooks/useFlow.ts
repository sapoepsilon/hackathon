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
import { DataType, InputConfig, method } from "@/components/ui/deploy-dialog";

interface NodeData {
  label: string;
  type?: 'api' | 'response' | 'value';
  deploymentUrl?: string;
  containerId?: string;
  method?: method;
  output?: any;
  outputType?: DataType;
  inputs?: InputConfig[];
  // For value nodes
  valueType?: DataType;
  value?: any;
  inputValues?: { [key: string]: any };
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
        // Get the output type from source node
        const sourceOutput = sourceNode.data.output;
        const sourceType = sourceNode.data.outputType;
        
        // Get the target input configuration
        const targetInput = targetNode.data.inputs?.find(
          (input: any) => input.id === params.targetHandle
        );

        // Check if types match
        if (targetInput && sourceType === targetInput.type) {
          // Add the connection
          setEdges(eds => addEdge(params, eds));

          // Update target node's input values
          setNodes(nds => 
            nds.map(node => 
              node.id === targetNode.id 
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      inputValues: {
                        ...node.data.inputValues,
                        [params.targetHandle || '']: sourceOutput
                      }
                    }
                  }
                : node
            )
          );
        } else {
          console.warn('Connection invalid: types do not match', {
            sourceType,
            targetType: targetInput?.type
          });
        }
      }
    },
    [nodes, setNodes, setEdges]
  );

  const addNode = useCallback(async (nodeData: any) => {
    const newNode: Node = {
      id: nodeData.id || `${nodes.length + 1}`,
      type: nodeData.type,
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 300 
      },
      data: {
        ...nodeData,
        id: nodeData.id || `${nodes.length + 1}`,
      },
    };

    console.log('Creating node with data:', newNode); // Debug log
    setNodes(nds => [...nds, newNode]);
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
