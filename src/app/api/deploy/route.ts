import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { supabase } from '@/lib/supabase';
import type { Deployment } from '@/types/deployment';
import { dockerContainer } from '@/types/dockerContainer';

const execAsync = promisify(exec);

function getRandomPort(min = 3000, max = 9000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const containerId = randomBytes(4).toString('hex');
    const port = getRandomPort();
    
    // Create a temporary directory for the container
    const containerDir = join(process.cwd(), 'tmp', containerId);
    await execAsync(`mkdir -p ${containerDir}`);

    // Write the code to a file
    await writeFile(join(containerDir, 'index.js'), code);
    
    // Create Dockerfile
    await writeFile(join(containerDir, 'Dockerfile'), `FROM node:18-alpine
WORKDIR /app
COPY index.js .
EXPOSE ${port}
CMD ["node", "index.js"]`);

    // Build and run the Docker container
    await execAsync(`docker build -t node-app-${containerId} ${containerDir}`);
    const { stdout: containerIdOutput } = await execAsync(`docker run -d --name container-${containerId} -p ${port}:3000 node-app-${containerId}`);
    
    // Get the full container ID
    const actualContainerId = containerIdOutput.trim();

    const url = `http://localhost:${port}`;
    const containerFullId = `container-${containerId}`;

    console.log('Container ID:', actualContainerId);

    // USING bash get the container information
    const { stdout } = await execAsync(`docker inspect ${actualContainerId}`);
    const containerInfo: dockerContainer = JSON.parse(stdout)[0];

    // Save deployment information to Supabase
    const deployment: Deployment = {
      container_id: containerInfo.Config.Hostname,
      code,
      url,
    };

    const { error: supabaseError } = await supabase
      .from('deployments')
      .insert(deployment);

    if (supabaseError) {
      console.error('Failed to save deployment to Supabase:', supabaseError);
      // Continue with deployment even if Supabase save fails
    }

    return NextResponse.json({
      success: true,
      containerId: containerFullId,
      url,
    });
  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error || 'Failed to deploy container',
    }, { status: 500 });
  }
}
