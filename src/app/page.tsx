"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DockerContainersTable } from "../components/DockerContainersTable";
import { DockerContainer } from "@/types/docker";
import { useToast } from "@/hooks/use-toast";
import { DeploymentToast } from "@/components/DeploymentToast";
import ignoredContainers from "./api/containers/ignored-containers.json";

import { CodeEditor } from "@/components/CodeEditor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { IconDocker } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FlowCanvas from "@/components/FlowCanvas";

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
    <div className="h-screen">
      <Sheet>
        <NavigationMenu className="p-4">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-background hover:bg-accent">
                Menu
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-2">
                <SheetTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="flex items-center gap-2">
                      <IconDocker className="h-4 w-4" />
                      View Containers
                    </div>
                  </Button>
                </SheetTrigger>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Tabs defaultValue="code" className="w-200px">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">Code Editor</TabsTrigger>
            <TabsTrigger value="flow">Flow Canvas</TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            <div>
              <CodeEditor code={code} onChange={setCode} />
            </div>
          </TabsContent>
          <TabsContent value="flow">
            <div className="container mx-auto py-10">
              <FlowCanvas height="75vh" />
            </div>
          </TabsContent>
        </Tabs>

        <SheetContent style={{ maxWidth: "50vw" }}>
          <SheetHeader>
            <SheetTitle>Docker Containers</SheetTitle>
          </SheetHeader>
          <div className="h-full mt-4">
            <Card>
              <CardContent className="p-4">
                <DockerContainersTable containers={nonIgnoredContainers} />
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
