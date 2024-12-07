import { ReactFlow, Background, Controls, Node, addEdge } from "@xyflow/react";
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
import { useEffect, useState, useCallback, useMemo } from "react";
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
  const [apiInput, setApiInput] = useState("");
  const [inputType, setInputType] = useState<
    "string" | "number" | "json" | "array-number" | "array-string"
  >("string");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

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
      console.log(`container method: ${container.method}`);
      await addNode({
        type: "api",
        label: `${container.method} ${container.url}`,
        containerId: container.container_id,
        deploymentUrl: `http://localhost:${
          selectedContainer.Ports.split(":")[1].split("->")[0]
        }`,
        method: container.method,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error getting container URL:", error);
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.data.type === "api") {
      setSelectedNode(node);
      setIsApiDialogOpen(true);
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

  const nodeTypes = useMemo(
    () => ({
      response: ({ data }: { data: any }) => (
        <div className="px-4 py-2 shadow-lg rounded-md bg-background border border-border">
          <div className="font-bold text-sm">{data.label}</div>
          {data.output && (
            <div className="mt-2 text-xs max-w-[200px] max-h-[100px] overflow-auto">
              <pre className="bg-secondary/50 p-2 rounded">
                {JSON.stringify(data.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ),
    }),
    []
  );

  return (
    <div
      style={{ width, height, position: "relative" }}
      className="rounded-lg overflow-hidden border border-border"
    >
      <div className="absolute top-4 right-4 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="secondary">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Docker Container</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              {containers.map((container) => (
                <Button
                  key={container.url}
                  variant="outline"
                  onClick={() => handleContainerSelect(container)}
                >
                  {container.url || `no url for ${container.container_id}`}
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
        onConnect={(params) => {
          const sourceNode = nodes.find((n) => n.id === params.source);
          const targetNode = nodes.find((n) => n.id === params.target);

          if (sourceNode && targetNode) {
            // Add the connection
            setEdges((eds) => addEdge(params, eds));

            // If the target node is an API node, trigger the API call with the source node's output
            if (targetNode.data.type === "api" && sourceNode.data.output) {
              handleApiCall();
            }
          }
        }}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode={currentTheme === "dark" ? "dark" : "light"}
        className="transition-colors duration-200"
      >
        <Background gap={12} size={1} />
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
    </div>
  );
}
