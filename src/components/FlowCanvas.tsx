import { ReactFlow, Background, Controls } from "@xyflow/react";
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
import { DockerContainer } from "@/types/docker";
import { dockerContainer } from "@/types/dockerContainer";

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
        console.log(
          `Docker: ${JSON.stringify(c)} Supabase ${JSON.stringify(container)}`
        );
        return c.ID === container.container_id;
      });

      if (!selectedContainer) {
        console.error("Container not found");
        return;
      }

      await addNode({
        type: "api",
        label: container.url,
        containerId: container.container_id,
        deploymentUrl: `http://localhost:${
          selectedContainer.Ports.split(":")[1].split("->")[0]
        }`,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error getting container URL:", error);
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
        fitView
        proOptions={{ hideAttribution: true }}
        colorMode={currentTheme === "dark" ? "dark" : "light"}
        className="transition-colors duration-200"
      >
        <Background gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
