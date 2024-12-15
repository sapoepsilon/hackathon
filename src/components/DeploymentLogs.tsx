'use client';

import { Card, CardContent } from '@/components/ui/card';

interface DeploymentLogsProps {
  logs: string;
}

export function DeploymentLogs({ logs }: DeploymentLogsProps) {
  if (!logs) return null;
  
  return (
    <Card>
      <CardContent className="p-4 font-mono text-sm">
        {logs}
      </CardContent>
    </Card>
  );
}
