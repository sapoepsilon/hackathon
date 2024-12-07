export interface DockerContainer {
  ID: string
  Names: string[]
  Image: string
  State: string
  Status: string
  Command: string
  CreatedAt: string
  Ports: string
  Size: string
  Networks: string
  Mounts: string
  LocalVolumes: string
  RunningFor: string
}

export interface DockerContainersResponse {
  success: boolean
  containers?: DockerContainer[]
  error?: string
}
