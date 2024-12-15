import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { DockerContainer } from "@/types/docker";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // Import supabase
import ignoredContainers from "../app/api/containers/ignored-containers.json";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DockerContainersTableProps {
  containers: DockerContainer[];
  onContainerDeleted?: () => void;
}

export function DockerContainersTable({
  containers,
  onContainerDeleted,
}: DockerContainersTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [containerLogs, setContainerLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const deleteContainer = async (containerId: string) => {
    try {
      console.log(`Starting deletion process for container: ${containerId}`);

      setLoading(`delete-${containerId}`);

      // Delete from Supabase first
      const { error: supabaseError, data } = await supabase
        .from("deployments")
        .delete()
        .eq("container_id", containerId)
        .select();

      console.log(`Supabase delete response:`, { data, error: supabaseError });

      if (supabaseError) throw new Error(supabaseError.message);

      // Delete from Docker
      const response = await fetch(`/api/containers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ containerId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete container");
      }

      toast({
        description: "Container deleted successfully",
      });

      if (onContainerDeleted) {
        onContainerDeleted();
      }
    } catch (error) {
      console.error("Error in deleteContainer:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete container",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getContainerUrls = async (containerId: string) => {
    try {
      setLoading(`url-${containerId}`);
      const response = await fetch("/api/containers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ containerId }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      if (data.urls.length === 0) {
        toast({
          title: "No URLs available",
          description: `No URLs available for container ${containerId}.`,
        });
        return;
      }

      await navigator.clipboard.writeText(data.urls[0]);
      toast({
        title: "Container URLs",
        description: `Container ${containerId} URLs: ${data.urls.join(", ")}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to get container URLs",
        description: `Container ${containerId} failed to get URLs ${error}.`,
      });
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const viewLogs = async (containerId: string) => {
    try {
      setLoading(`logs-${containerId}`);
      setActiveContainerId(containerId);
      setIsLogsOpen(true);

      const response = await fetch(`/api/containers/${containerId}/logs`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch container logs');
      }
      
      if (!data.logs || !Array.isArray(data.logs)) {
        throw new Error('Invalid logs data received');
      }

      setContainerLogs(data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch container logs",
      });
      setIsLogsOpen(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Running Docker Containers</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Container ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers
                .filter(
                  (container) =>
                    !ignoredContainers.ignoredContainers.includes(
                      container.ID.substring(0, 12)
                    )
                )
                .map((container) => (
                  <TableRow key={container.ID}>
                    <TableCell>{container.ID.substring(0, 12)}</TableCell>
                    <TableCell>
                      {container.Names[0]?.replace("/", "")}
                    </TableCell>
                    <TableCell>{container.Image}</TableCell>
                    <TableCell>{container.State}</TableCell>
                    <TableCell>{container.Status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getContainerUrls(container.ID)}
                        disabled={loading === `url-${container.ID}`}
                      >
                        {loading === `url-${container.ID}`
                          ? "Loading..."
                          : "Get URL"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewLogs(container.ID)}
                        disabled={loading === `logs-${container.ID}`}
                      >
                        {loading === `logs-${container.ID}`
                          ? "Loading..."
                          : "View Logs"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContainer(container.ID)}
                        disabled={loading === `delete-${container.ID}`}
                      >
                        {loading === `delete-${container.ID}`
                          ? "Loading..."
                          : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isLogsOpen} onOpenChange={setIsLogsOpen}>
        <SheetContent side="bottom" className="h-[500px] w-full">
          <SheetHeader className="mb-4">
            <SheetTitle>Container Logs</SheetTitle>
          </SheetHeader>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={100}>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="font-mono text-sm">
                  {containerLogs.map((log, index) => (
                    <div key={index} className="py-1">
                      {log}
                    </div>
                  ))}
                </pre>
              </ScrollArea>
            </ResizablePanel>
            <ResizableHandle />
          </ResizablePanelGroup>
        </SheetContent>
      </Sheet>
    </>
  );
}
