import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DockerContainer } from "@/types/docker"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import ignoredContainers from '../api/containers/ignored-containers.json'

interface DockerContainersTableProps {
  containers: DockerContainer[]
  onContainerDeleted?: () => void
}

export function DockerContainersTable({ containers, onContainerDeleted }: DockerContainersTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast()
  const deleteContainer = async (containerId: string) => {
    try {
      setLoading(`delete-${containerId}`);
      const response = await fetch('/api/containers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      toast({
        title: 'Container deleted',
        description: `Container ${containerId} has been deleted successfully.`,
      });
      onContainerDeleted?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete container',
        description: `Container ${containerId} failed to delete ${error}.`,
      });
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const getContainerUrls = async (containerId: string) => {
    try {
      setLoading(`url-${containerId}`);
      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ containerId }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      if (data.urls.length === 0) {
        toast({
          title: 'No URLs available',
          description: `No URLs available for container ${containerId}.`,
        })
        return;
      }

      await navigator.clipboard.writeText(data.urls[0]);
      toast({
        title: 'Container URLs',
        description: `Container ${containerId} URLs: ${data.urls.join(', ')}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to get container URLs',
        description: `Container ${containerId} failed to get URLs ${error}.`,
      });
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
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
              .filter((container) => !ignoredContainers.ignoredContainers.includes(container.ID.substring(0, 12)))
              .map((container) => (
              <TableRow key={container.ID}>
                <TableCell>{container.ID.substring(0, 12)}</TableCell>
                <TableCell>{container.Names[0]?.replace('/', '')}</TableCell>
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
                    {loading === `url-${container.ID}` ? 'Loading...' : 'Get URL'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteContainer(container.ID)}
                    disabled={loading === `delete-${container.ID}`}
                  >
                    {loading === `delete-${container.ID}` ? 'Loading...' : 'Delete'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
