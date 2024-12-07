import { ReactFlow, Background, Controls, Node, addEdge, Handle, Position, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/flow.css";
import { useFlow } from "../hooks/useFlow";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState, useMemo } from "react";
import { Deployment } from "@/types/deployment";
import { supabase } from "@/lib/supabase";
import { dockerContainer } from "@/types/dockerContainer";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlowCanvasProps {
  height?: string;
  width?: string;
}

export default function FlowCanvas({
  height = "75vh",
  width = "100%",
}: FlowCanvasProps): JSX.Element {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    setNodes,
    setEdges,
  } = useFlow([], []);
  const { theme, systemTheme } = useTheme();
  const [containers, setContainers] = useState<Deployment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedResponseNode, setSelectedResponseNode] = useState<Node | null>(null);
  const [apiInput, setApiInput] = useState("");
  const [inputType, setInputType] = useState<
    "string" | "number" | "json" | "array-number" | "array-string"
  >("string");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [selectedJsonPath, setSelectedJsonPath] = useState<string>("");
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOrder, setExecutionOrder] = useState<string[]>([]);

  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const fetchContainers = async () => {
      const { data: deployments } = await supabase
        .from("deployments")
        .select("*");
      if (deployments) {
        setContainers(deployments);
      }
    };
    fetchContainers();
  }, []);

  const handleContainerSelect = async (container: Deployment) => {
    try {
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

      const newNode = await addNode({
        id: `node-${Date.now()}`,
        type: "api",
        label: `${container.method} ${container.url}`,
        containerId: container.container_id,
        deploymentUrl: `http://localhost:${
          selectedContainer.Ports.split(":")[1].split("->")[0]
        }`,
        method: container.method,
        inputs: container.inputs?.map(input => ({
          id: input.id,
          type: input.type
        })) || [],
        outputType: container.outputs,
        inputValues: {},
        output: null,
      });

      console.log('Created new node:', newNode); // Debug log
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error getting container URL:", error);
    }
  };

  const getJsonPaths = (obj: any, parentPath = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];
    
    return Object.entries(obj).reduce((paths: string[], [key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      paths.push(currentPath);
      
      if (value && typeof value === "object" && !Array.isArray(value)) {
        paths.push(...getJsonPaths(value, currentPath));
      }
      return paths;
    }, []);
  };

  const getValueFromPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);  // Debug log
    if (node.data.type === "api") {
      setSelectedNode(node);
      setIsApiDialogOpen(true);
    } else if (node.type === "response" || (node.data && node.data.type === "response")) {
      console.log("Response node clicked, data:", node.data);  // Debug log
      if (node.data && node.data.output && typeof node.data.output === "object") {
        setSelectedResponseNode(node);
        setSelectedJsonPath("");
        setIsJsonDialogOpen(true);
      }
    }
  };

  const handleApiCall = async () => {
    if (!selectedNode?.data.deploymentUrl) return;

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: selectedNode.data.deploymentUrl,
          method: selectedNode.data.method,
          data: {
            input: apiInput
              ? inputType === "json"
                ? JSON.parse(apiInput)
                : inputType === "array-number" || inputType === "array-string"
                ? (() => {
                    try {
                      const parsed = JSON.parse(apiInput);
                      if (!Array.isArray(parsed)) {
                        throw new Error("Input must be an array");
                      }
                      if (inputType === "array-number") {
                        if (!parsed.every((item) => typeof item === "number")) {
                          throw new Error("All array items must be numbers");
                        }
                      } else if (inputType === "array-string") {
                        if (!parsed.every((item) => typeof item === "string")) {
                          throw new Error("All array items must be strings");
                        }
                      }
                      return parsed;
                    } catch (e) {
                      throw new Error(
                        e instanceof Error ? e.message : "Invalid array format"
                      );
                    }
                  })()
                : inputType === "number"
                ? Number(apiInput)
                : apiInput
              : {},
          },
        }),
      });

      const data = await response.json();
      
      // Create a response node
      const responseNode: Node = {
        id: `response-${Date.now()}`,
        type: 'response',
        position: {
          x: selectedNode.position.x + 200,
          y: selectedNode.position.y,
        },
        data: {
          type: 'response',
          label: 'Response',
          output: data,
          outputType: typeof data === "object" ? "json" : typeof data,
        },
      };

      // Add response node
      setNodes((nds) => [...nds, responseNode]);

      // Connect API node to response node
      setEdges((eds) => [
        ...eds,
        {
          id: `${selectedNode.id}-${responseNode.id}`,
          source: selectedNode.id,
          target: responseNode.id,
        },
      ]);

      // Close the dialog
      setIsApiDialogOpen(false);
      setApiInput("");
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const handleJsonValueSelect = () => {
    console.log("Creating value node from:", selectedResponseNode); // Debug log
    if (!selectedResponseNode || !selectedJsonPath) return;

    const value = getValueFromPath(selectedResponseNode.data.output, selectedJsonPath);
    console.log("Selected value:", value); // Debug log
    
    // Create a new node with the selected value
    const valueNode: Node = {
      id: `value-${Date.now()}`,
      type: 'value',
      position: {
        x: (selectedResponseNode.position?.x || 0) + 200,
        y: (selectedResponseNode.position?.y || 0),
      },
      data: {
        type: 'value',
        label: `Value: ${selectedJsonPath}`,
        output: value,
        outputType: typeof value === "object" ? "json" : typeof value,
      },
    };

    console.log("Creating value node:", valueNode); // Debug log

    // Add value node
    setNodes((nds) => {
      console.log("Current nodes:", nds); // Debug log
      return [...nds, valueNode];
    });

    // Connect response node to value node
    setEdges((eds) => [
      ...eds,
      {
        id: `${selectedResponseNode.id}-${valueNode.id}`,
        source: selectedResponseNode.id,
        target: valueNode.id,
      },
    ]);

    setIsJsonDialogOpen(false);
  };

  const executeApiNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.data.type !== 'api') return;

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: node.data.deploymentUrl,
          method: node.data.method,
          data: { input: node.data.inputValues || {} },
        }),
      });

      const data = await response.json();
      
      // Update the node with the response
      setNodes(nds => 
        nds.map(n => 
          n.id === nodeId 
            ? { ...n, data: { ...n.data, output: data, outputType: typeof data === "object" ? "json" : typeof data } }
            : n
        )
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
      // Find all API nodes
      const apiNodes = nodes.filter(n => n.data.type === 'api');
      
      // Sort nodes based on connections
      const sortedNodes = topologicalSort(apiNodes, edges);
      setExecutionOrder(sortedNodes.map(n => n.id));

      // Execute nodes in sequence
      for (const nodeId of executionOrder) {
        await executeApiNode(nodeId);
      }
    } catch (error) {
      console.error("Error executing flow:", error);
    }
    setIsExecuting(false);
  };

  const topologicalSort = (apiNodes: Node[], edges: Edge[]) => {
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    apiNodes.forEach(node => {
      graph.set(node.id, new Set());
      inDegree.set(node.id, 0);
    });

    // Build graph
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode?.data.type === 'api' && targetNode?.data.type === 'api') {
        graph.get(edge.source)?.add(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    });

    // Perform topological sort
    const result: Node[] = [];
    const queue = apiNodes.filter(node => (inDegree.get(node.id) || 0) === 0);

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      graph.get(node.id)?.forEach(neighbor => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(nodes.find(n => n.id === neighbor)!);
        }
      });
    }

    return result;
  };

  const nodeTypes = useMemo(
    () => ({
      api: ({ data }: { data: any }) => (
        <div className="relative px-4 py-2 shadow-lg rounded-md bg-background border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sm">{data.label}</div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                executeApiNode(data.id);
              }}
              disabled={isExecuting}
            >
              Run
            </Button>
          </div>
          
          {/* Input handles */}
          <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around">
            {data.inputs?.map((input: any) => (
              <div key={input.id} className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">in: {input.type}</div>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.id}
                  style={{ background: '#555' }}
                />
              </div>
            ))}
          </div>
          
          {/* Output handle */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="text-xs text-muted-foreground">out: {data.outputType}</div>
            <Handle
              type="source"
              position={Position.Right}
              id="output"
              style={{ background: '#555' }}
            />
          </div>

          {/* Display input values if any */}
          {data.inputValues && Object.entries(data.inputValues).length > 0 && (
            <div className="mt-2 text-xs">
              <div className="font-semibold">Inputs:</div>
              {Object.entries(data.inputValues).map(([key, value]) => (
                <div key={key} className="ml-2">
                  {key}: {JSON.stringify(value)}
                </div>
              ))}
            </div>
          )}

          {/* Display output if any */}
          {data.output && (
            <div className="mt-2 text-xs">
              <div className="font-semibold">Output:</div>
              <div className="ml-2 max-w-[200px] overflow-hidden">
                <pre className="bg-secondary/50 p-2 rounded">
                  {JSON.stringify(data.output, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ),
    }),
    [executeApiNode, isExecuting]
  );

  return (
    <div style={{ width, height }} className="relative rounded-lg border border-border">
      <div className="absolute top-4 right-4 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Node
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Node</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {containers.map((container) => (
                <Button
                  key={container.id}
                  variant="outline"
                  onClick={() => handleContainerSelect(container)}
                >
                  {container.url}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call API Node</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label>Input Type</label>
              <Select
                value={inputType}
                onValueChange={(
                  value:
                    | "string"
                    | "number"
                    | "json"
                    | "array-number"
                    | "array-string"
                ) => setInputType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="array-number">Array of Numbers</SelectItem>
                  <SelectItem value="array-string">Array of Strings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label>Input (optional)</label>
              <Input
                value={apiInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (inputType === "number") {
                    if (value === "" || !isNaN(Number(value))) {
                      setApiInput(value);
                    }
                  } else {
                    setApiInput(value);
                  }
                }}
                type={inputType === "number" ? "number" : "text"}
                placeholder={`Enter ${
                  inputType === "json"
                    ? "JSON input"
                    : inputType === "array-number"
                    ? "numbers (e.g., [1,2,3])"
                    : inputType === "array-string"
                    ? "strings (e.g., ['a','b','c'])"
                    : inputType
                } input`}
              />
            </div>
            <Button onClick={handleApiCall}>Call API</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select JSON Value</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label>Available Paths</label>
              <Select
                value={selectedJsonPath}
                onValueChange={(value) => {
                  console.log("Selected path:", value); // Debug log
                  setSelectedJsonPath(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a value" />
                </SelectTrigger>
                <SelectContent>
                  {selectedResponseNode?.data.output &&
                    getJsonPaths(selectedResponseNode.data.output).map((path) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label>Preview</label>
              <pre className="bg-secondary p-2 rounded text-xs">
                {selectedJsonPath && selectedResponseNode
                  ? JSON.stringify(
                      getValueFromPath(selectedResponseNode.data.output, selectedJsonPath),
                      null,
                      2
                    )
                  : "Select a path to preview value"}
              </pre>
            </div>
            <Button 
              onClick={() => {
                console.log("Extract Value clicked"); // Debug log
                handleJsonValueSelect();
              }}
            >
              Extract Value
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          onClick={executeFlow}
          disabled={isExecuting}
          size="lg"
        >
          {isExecuting ? "Executing..." : "Execute Flow"}
        </Button>
      </div>
    </div>
  );
}
