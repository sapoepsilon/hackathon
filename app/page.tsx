'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function Home() {
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [containerLogs, setContainerLogs] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [code, setCode] = useState('// Write your code here\n');

  const handleDeploy = async () => {
    setDeploymentStatus('deploying');
    setContainerLogs('Deploying...');
    
    setTimeout(() => {
      setDeploymentStatus('deployed');
      setContainerLogs('Container running successfully');
      setDeployedUrl('https://your-app.example.com');
    }, 2000);
  };

  return (
    <main>
      <div>
        <div>
          <Editor
            height="500px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        <div>
          <div>
            <button
              onClick={handleDeploy}
              disabled={deploymentStatus === 'deploying'}
            >
              {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy'}
            </button>
          </div>

          <div>
            <h3>Status</h3>
            <p>
              {deploymentStatus.charAt(0).toUpperCase() + deploymentStatus.slice(1)}
            </p>
          </div>
        </div>

        <div>
          <div>
            <h3>Container Logs</h3>
            <pre>
              {containerLogs || 'No logs available'}
            </pre>
          </div>

          <div>
            <h3>Deployed URL</h3>
            {deployedUrl ? (
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {deployedUrl}
              </a>
            ) : (
              <p>Not deployed yet</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
