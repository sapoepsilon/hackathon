import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('docker ps --format "{{json .}}"');
    const containers = stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line));

      console.log(`container: ${JSON.stringify(containers)}`);

    return NextResponse.json({ success: true, containers });
  } catch (error) {
    console.error('Error fetching Docker containers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Docker containers' },
      { status: 500 }
    );
  }
}
