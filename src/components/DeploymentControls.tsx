'use client';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeploymentControlsProps {
  onDeploy: () => void;
  deploymentStatus: string;
  deployedUrl: string;
}

export function DeploymentControls({
  onDeploy,
  deploymentStatus,
  deployedUrl,
}: DeploymentControlsProps) {
  return (
    <div className="flex justify-between items-center">
      <Button 
        onClick={onDeploy}
        disabled={deploymentStatus === 'deploying'}
      >
        {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy'}
      </Button>

      {deployedUrl && (
        <Alert>
          <AlertDescription>
            Your application is running at: <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{deployedUrl}</a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
