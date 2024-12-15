"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { DockerContainersTable } from "../components/DockerContainersTable";
import { DeploymentToast } from "@/components/DeploymentToast";
import { useDeployment } from "@/hooks/useDeployment";
import { useContainers } from "@/hooks/useContainers";
import { DataType, InputConfig } from "@/components/ui/deploy-dialog";
import { useState } from "react";
import AppSidebar from "@/components/appSideBar";

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

  const { deploymentStatus, handleDeploy } = useDeployment();
  const { containers } = useContainers();

  const handleDeployWithConfig = async (
    input: InputConfig[],
    output: DataType,
    method: string
  ) => {
    await handleDeploy(code, input, output, method);
  };

  return (
    <>
      <Sheet>
        <AppSidebar
          code={code}
          onCodeChange={setCode}
          deploymentStatus={deploymentStatus}
          onDeploy={handleDeployWithConfig}
        />
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
    </>
  );
}
