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
        </div>
      </div>
    </main>
  );
}
