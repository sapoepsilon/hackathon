"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DockerContainersTable } from "../components/DockerContainersTable";
import { DeploymentToast } from "@/components/DeploymentToast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Navigation } from "@/components/Navigation";
import { EditorTabs } from "@/components/EditorTabs";
import { useDeployment } from "@/hooks/useDeployment";
import { useContainers } from "@/hooks/useContainers";
import { ContainerCompletionDialog } from "@/components/ContainerCompletionDialog";

export default function Home() {
  const [code, setCode] = useState(`// Write your Node.js code here
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from your deployed container!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedContainerId, setCompletedContainerId] = useState<string>("");
  const [completedPort, setCompletedPort] = useState<string>("");

  const { deploymentStatus, handleDeploy, containerDetails } = useDeployment();
  const { containers } = useContainers();

  useEffect(() => {
    if (deploymentStatus === "deployed" && containerDetails) {
      setCompletedContainerId(containerDetails.containerId);
      // Extract port from URL (e.g., http://localhost:3000 -> 3000)
      const port = containerDetails.url.split(":")[2];
      setCompletedPort(port);
      setDialogOpen(true);
    }
  }, [deploymentStatus, containerDetails]);

  return (
    <div className="h-screen">
      <Sheet>
        <Navigation
          deploymentStatus={deploymentStatus}
          onDeploy={() => handleDeploy(code)}
        />
        <EditorTabs code={code} onCodeChange={setCode} />

        <SheetContent style={{ maxWidth: "60vw" }}>
          <SheetHeader>
            <SheetTitle>Docker Containers</SheetTitle>
          </SheetHeader>
          <div className="h-full mt-4">
            <Card>
              <CardContent className="p-4">
                <DockerContainersTable containers={containers} />
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
      {deploymentStatus === "error" && (
        <DeploymentToast
          title="Deployment Failed"
          message="Failed to deploy container"
          type="destructive"
        />
      )}
      <ContainerCompletionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        containerId={completedContainerId}
        port={completedPort}
      />
    </div>
  );
}
