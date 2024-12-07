export interface DeploymentInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required: boolean;
  default_value?: string;
}

export interface DeploymentOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
}

export interface NodeCoordinates {
  x: number;
  y: number;
}

export interface DeploymentConfig {
  id?: string;
  deployment_id: string;
  container_id: string;
  inputs: DeploymentInput[];
  outputs: DeploymentOutput[];
  node_coordinates: NodeCoordinates;
  created_at?: string;
  updated_at?: string;
}
