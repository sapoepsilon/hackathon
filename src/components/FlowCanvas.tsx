import { ReactFlow, Background, Controls, Node } from "@xyflow/react";
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
import { useEffect, useState } from "react";
import { Deployment } from "@/types/deployment";
import { supabase } from "@/lib/supabase";
import { dockerContainer } from "@/types/dockerContainer";
import { Input } from "./ui/input";

interface FlowCanvasProps {
  height?: string;
  width?: string;
}

export default function FlowCanvas({
  height = "75vh",
  width = "100%",
}: FlowCanvasProps): JSX.Element {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlow([], []);
  const { theme, systemTheme } = useTheme();
  const [containers, setContainers] = useState<Deployment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [apiInput, setApiInput] = useState("");
  const [apiOutput, setApiOutput] = useState<string | null>(null);
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
        label: container.url,
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

    console.log("Calling API:", selectedNode.data);

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: selectedNode.data.deploymentUrl,
          method: selectedNode.data.method,
          data: apiInput ? { input: apiInput } : {}
        }),
      });

      const data = await response.json();
      setApiOutput(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error calling API:", error);
      setApiOutput("Error calling API: " + error);
    }
  };

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
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
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
              <label>Input (optional)</label>
              <Input
                value={apiInput}
                onChange={(e) => setApiInput(e.target.value)}
                placeholder="Enter API input in JSON format"
              />
            </div>
            <Button onClick={handleApiCall}>Call API</Button>
            {apiOutput && (
              <div className="grid gap-2">
                <label>Output</label>
                <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-[200px]">
                  {apiOutput}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
