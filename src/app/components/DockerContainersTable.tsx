import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

interface Container {
  ID: string
  Names: string[]
  Image: string
  State: string
  Status: string
}

interface DockerContainersTableProps {
  containers: Container[]
}

export function DockerContainersTable({ containers }: DockerContainersTableProps) {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {containers.map((container) => (
              <TableRow key={container.ID}>
                <TableCell>{container.ID.substring(0, 12)}</TableCell>
                <TableCell>{container.Names[0]?.replace('/', '')}</TableCell>
                <TableCell>{container.Image}</TableCell>
                <TableCell>{container.State}</TableCell>
                <TableCell>{container.Status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
