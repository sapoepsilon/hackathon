"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DockerContainersTable } from "../components/DockerContainersTable";
import { DockerContainer } from "@/types/docker";
import { useToast } from "@/hooks/use-toast";
import { DeploymentToast } from "@/components/DeploymentToast";
import ignoredContainers from "./api/containers/ignored-containers.json";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { CodeEditor } from "@/components/CodeEditor";

export default function Home() {
  const { toast } = useToast();
  const [deploymentStatus, setDeploymentStatus] = useState("idle");
  const [code, setCode] = useState(`// Write your Node.js code here
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from your deployed container!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const nonIgnoredContainers = containers.filter(
    (container) => !ignoredContainers.ignoredContainers.includes(container.ID)
  );

  const handleDeploy = async () => {
    try {
      setDeploymentStatus("deploying");
      toast({
        description: "Building and deploying container...",
      });

      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setDeploymentStatus("deployed");
        toast({
          title: "Deployment Successful",
          description: `Container ${data.containerId} deployed successfully at ${data.url}`,
          variant: "default",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setDeploymentStatus("error");
      toast({
        title: "Deployment Failed",
        description:
          error instanceof Error ? error.message : "no error message provided",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await fetch("/api/containers");
        const data = await response.json();
        if (data.success) {
          setContainers(data.containers);
        }
      } catch (error) {
        console.error("Failed to fetch containers:", error);
      }
    };

    fetchContainers();
    // Refresh container list every 5 seconds
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen p-4">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={75}>
          <div className="h-full p-2">
            <CodeEditor code={code} onChange={setCode} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25}>
          <div className="h-full p-2">
            <Card>
              <CardContent className="p-4">
                <DockerContainersTable containers={nonIgnoredContainers} />
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {deploymentStatus === "error" && (
        <DeploymentToast
          title="Deployment Failed"
          message="Failed to deploy container"
          type="destructive"
        />
      )}
      <div className="flex justify-between items-center">
        <Button
          onClick={handleDeploy}
          disabled={deploymentStatus === "deploying"}
        >
          {deploymentStatus === "deploying" ? "Deploying..." : "Deploy"}
        </Button>
      </div>
    </div>
  );
}
