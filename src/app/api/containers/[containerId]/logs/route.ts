import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(
  request: NextRequest,
  { params }: { params: { containerId: string } }
) {
  try {
    const { stdout, stderr } = await execAsync(
      `docker logs --tail 100 --timestamps ${params.containerId}`
    );

    if (stderr) {
      console.error('Docker logs stderr:', stderr);
    }

    // Split logs into lines and clean them
    const logLines = stdout
      .split('\n')
      .filter(Boolean)
      .map(line => line.trim());

    return Response.json({ logs: logLines });
  } catch (error) {
    console.error('Error fetching container logs:', error);
    return Response.json(
      { error: 'Failed to fetch container logs' },
      { status: 500 }
    );
  }
}
