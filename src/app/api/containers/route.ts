import { NextResponse, NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DockerContainer, DockerContainersResponse } from '@/types/docker';

const execAsync = promisify(exec);

export async function GET(): Promise<NextResponse<DockerContainersResponse>> {
  try {
    const { stdout } = await execAsync('docker ps --format "{{json .}}"');
    const containers = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line) as DockerContainer);

    return NextResponse.json({ success: true, containers });
  } catch (error) {
    console.error('Error fetching Docker containers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Docker containers' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { containerId } = await request.json();
    await execAsync(`docker rm -f ${containerId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Docker container:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete Docker container' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { containerId } = await request.json();
    const { stdout } = await execAsync(`docker port ${containerId}`);
    const ports = stdout.trim().split('\n');
    const mappings = ports.map(port => {
      const [internal, external] = port.split(' -> ');
      const externalPort = external.split(':')[1];
      return `http://localhost:${externalPort}`;
    });
    return NextResponse.json({ success: true, urls: mappings });
  } catch (error) {
    console.error('Error getting container URLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get container URLs' },
      { status: 500 }
    );
  }
}
