import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Deployment } from "@/types/deployment";
import { dockerContainer } from "@/types/dockerContainer";
import { topologicalSort } from "@/lib/utils";

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  containers: Deployment[];
  isExecuting: boolean;
  executionOrder: string[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  executeApiNode: (nodeId: string) => Promise<any>;
  executeFlow: () => Promise<void>;
  addNode: (container: Deployment) => Promise<void>;
  addCombinerNode: () => void;
  updateCombinerNodes: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlowContext must be used within a FlowProvider");
  }
  return context;
};

interface FlowProviderProps {
  children: ReactNode;
}

export const FlowProvider = ({ children }: FlowProviderProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [containers, setContainers] = useState<Deployment[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOrder, setExecutionOrder] = useState<string[]>([]);

  useEffect(() => {
    const fetchContainers = async () => {
      const { data: deployments } = await supabase.from("deployments").select("*");
      if (deployments) {
        setContainers(deployments);
      }
    };
    fetchContainers();
  }, []);

  const onNodesChange = (changes: any) => {
    setNodes(applyNodeChanges(changes, nodes));
  };

  const onEdgesChange = (changes: any) => {
    setEdges(applyEdgeChanges(changes, edges));
  };

  const onConnect = (params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    // Get source type from either outputType or data-type attribute
    const sourceType = sourceNode?.type === 'combiner' ? 'json' : (sourceNode?.data?.outputType || 'json');
    
    // Find the target input type from the inputs array for API nodes
    let targetType = 'json';
    if (targetNode?.type === 'api') {
      const targetInput = targetNode.data.inputs?.find(input => input.id === params.targetHandle);
      targetType = targetInput?.type || 'json';
    } else if (targetNode?.type === 'combiner') {
      targetType = 'json';
    }
    
    if (sourceType === targetType) {
      setEdges((eds) => addEdge(params, eds));
      
      // Update target node's input values if source is a combiner
      if (sourceNode?.type === 'combiner' && sourceNode.data.combined) {
        setNodes(nds => 
          nds.map(n => 
            n.id === targetNode?.id 
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    inputValues: {
                      ...n.data.inputValues,
                      [params.targetHandle || '']: sourceNode.data.combined
                    }
                  }
                }
              : n
          )
        );
      }
    }
  };

  const executeApiNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    try {
      console.log('Executing node:', node); 
      console.log('Node data:', node.data); 

      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: node.data.deploymentUrl,
          method: node.data.method,
          data: { input: node.data.inputValues?.input || {} },
        }),
      });

      console.log('API Response status:', response.status); 
      const data = await response.json();
      console.log('API Response data:', data); 
      
      setNodes(nds => 
        nds.map(n => {
          if (n.id === nodeId) {
            console.log('Updating node:', n.id); 
            return {
              ...n,
              data: {
                ...n.data,
                output: data,
                outputType: typeof data === "object" ? "json" : typeof data,
              },
            };
          }
          return n;
        })
      );

      return data;
    } catch (error) {
      console.error("Error executing API node:", error);
      return null;
    }
  };

  const executeFlow = async () => {
    setIsExecuting(true);
    try {
      const apiNodes = nodes.filter(n => n.data.type === 'api');
      const sortedNodes = topologicalSort(apiNodes, edges);
      setExecutionOrder(sortedNodes.map(n => n.id));

      for (const nodeId of executionOrder) {
        await executeApiNode(nodeId);
      }
    } catch (error) {
      console.error("Error executing flow:", error);
    }
    setIsExecuting(false);
  };

  const addNode = async (container: Deployment) => {
    try {
      console.log('Adding node for container:', container); 
      const response = await fetch("/api/containers");
      const data = await response.json();

      if (!data.success || !data.containers) {
        console.error("Failed to get containers");
        return;
      }

      const selectedContainer = data.containers.find((c: dockerContainer) => {
        return c.ID === container.container_id;
      });

      if (!selectedContainer) {
        console.error("Container not found");
        return;
      }

      console.log('Selected container:', selectedContainer); 

      const deploymentUrl = `http://localhost:${
        selectedContainer.Ports.split(":")[1].split("->")[0]
      }`;

      console.log('Deployment URL:', deploymentUrl); 

      const newNode = {
        id: `node-${Date.now()}`,
        type: "api",
        position: { x: 100, y: 100 },
        data: {
          id: `node-${Date.now()}`,
          type: "api",
          label: `${container.method} ${container.url}`,
          containerId: container.container_id,
          deploymentUrl,
          method: container.method,
          inputs: container.inputs?.map(input => ({
            id: input.id,
            type: input.type
          })) || [],
          outputType: container.outputs,
          inputValues: {},
          output: null,
        },
      };

      console.log('Creating new node:', newNode); 
      setNodes((nds) => [...nds, newNode]);
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const addCombinerNode = () => {
    const newNode = {
      id: `combiner-${Date.now()}`,
      type: 'combiner',
      position: { x: 300, y: 200 },
      data: { 
        combined: null,
        outputType: 'json',
        inputs: [
          { id: 'input1', type: 'json' },
          { id: 'input2', type: 'json' }
        ],
        inputValues: {}
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateCombinerNodes = () => {
    let hasUpdates = false;
    const newNodes = nodes.map((node) => {
      if (node.type !== 'combiner') return node;

      const input1Edge = edges.find((e) => e.target === node.id && e.targetHandle === 'input1');
      const input2Edge = edges.find((e) => e.target === node.id && e.targetHandle === 'input2');
      
      if (!input1Edge || !input2Edge) return node;

      const sourceNode1 = nodes.find((n) => n.id === input1Edge.source);
      const sourceNode2 = nodes.find((n) => n.id === input2Edge.source);
      
      const value1 = sourceNode1?.data?.output;
      const value2 = sourceNode2?.data?.output;
      
      if (value1 === undefined || value2 === undefined) return node;
      
      const newCombined = {
        input1: value1,
        input2: value2
      };
      
      if (JSON.stringify(node.data.combined) === JSON.stringify(newCombined)) {
        return node;
      }
      
      hasUpdates = true;
      return {
        ...node,
        data: {
          ...node.data,
          combined: newCombined,
          output: newCombined
        }
      };
    });

    if (hasUpdates) {
      setNodes(newNodes);
    }
  };

  const value = {
    nodes,
    edges,
    containers,
    isExecuting,
    executionOrder,
    onNodesChange,
    onEdgesChange,
    onConnect,
    executeApiNode,
    executeFlow,
    addNode,
    addCombinerNode,
    updateCombinerNodes,
    setNodes,
    setEdges,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
