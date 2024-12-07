'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DockerContainersTable } from './components/DockerContainersTable';
import { DockerContainer } from '@/types/docker';

export default function Home() {
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [containerLogs, setContainerLogs] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
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

  const handleDeploy = async () => {
    try {
      setDeploymentStatus('deploying');
      setContainerLogs('Building and deploying container...');

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setDeploymentStatus('deployed');
        setContainerLogs(`Container ${data.containerId} running successfully`);
        setDeployedUrl(data.url);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setDeploymentStatus('error');
      setContainerLogs(`Deployment failed: ${error.message ?? 'no error message provided'}`);
    }
  };

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await fetch('/api/containers');
        const data = await response.json();
        if (data.success) {
          setContainers(data.containers);
        }
      } catch (error) {
        console.error('Failed to fetch containers:', error);
      }
    };

    fetchContainers();
    // Refresh container list every 5 seconds
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="container mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <Editor
            height="75vh"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button 
          onClick={handleDeploy}
          disabled={deploymentStatus === 'deploying'}
        >
          {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy'}
        </Button>

        {deployedUrl && (
          <Alert className="mt-4">
            <AlertDescription>
              Your application is deployed at: <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{deployedUrl}</a>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {containerLogs && (
        <Card>
          <CardContent className="p-4 font-mono text-sm">
            {containerLogs}
          </CardContent>
        </Card>
      )}

      <DockerContainersTable containers={containers} />
    </main>
  );
}