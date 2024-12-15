export type dockerContainer = {
    Id: string;
    Created: string;
    Path: string;
    Args: string[];
    State: {
      Status: string;
      Running: boolean;
      Paused: boolean;
      Restarting: boolean;
      OOMKilled: boolean;
      Dead: boolean;
      Pid: number;
      ExitCode: number;
      Error: string;
      StartedAt: string;
      FinishedAt: string;
    };
    Image: string;
    ResolvConfPath: string;
    HostnamePath: string;
    HostsPath: string;
    LogPath: string;
    Name: string;
    RestartCount: number;
    Driver: string;
    Platform: string;
    MountLabel: string;
    ProcessLabel: string;
    AppArmorProfile: string;
    ExecIDs: null | string[];
    HostConfig: {
      Binds: null | string[];
      ContainerIDFile: string;
      LogConfig: object;
      NetworkMode: string;
      PortBindings: object;
      RestartPolicy: object;
      AutoRemove: boolean;
      VolumeDriver: string;
      VolumesFrom: null | string[];
      ConsoleSize: number[];
      CapAdd: null | string[];
      CapDrop: null | string[];
      CgroupnsMode: string;
      Dns: string[];
      DnsOptions: string[];
      DnsSearch: string[];
      ExtraHosts: null | string[];
      GroupAdd: null | string[];
      IpcMode: string;
      Cgroup: string;
      Links: null | string[];
      OomScoreAdj: number;
      PidMode: string;
      Privileged: boolean;
      PublishAllPorts: boolean;
      ReadonlyRootfs: boolean;
      SecurityOpt: null | string[];
      UTSMode: string;
      UsernsMode: string;
      ShmSize: number;
      Runtime: string;
      Isolation: string;
      CpuShares: number;
      Memory: number;
      NanoCpus: number;
      CgroupParent: string;
      BlkioWeight: number;
      BlkioWeightDevice: BlkioWeightDevice[];
      BlkioDeviceReadBps: BlkioDeviceRate[];
      BlkioDeviceWriteBps: BlkioDeviceRate[];
      BlkioDeviceReadIOps: BlkioDeviceRate[];
      BlkioDeviceWriteIOps: BlkioDeviceRate[];
      CpuPeriod: number;
      CpuQuota: number;
      CpuRealtimePeriod: number;
      CpuRealtimeRuntime: number;
      CpusetCpus: string;
      CpusetMems: string;
      Devices: DeviceConfig[];
      DeviceCgroupRules: null | string[];
      DeviceRequests: null | DeviceRequest[];
      MemoryReservation: number;
      MemorySwap: number;
      MemorySwappiness: null | number;
      OomKillDisable: null | boolean;
      PidsLimit: null | number;
      Ulimits: Ulimit[];
      CpuCount: number;
      CpuPercent: number;
      IOMaximumIOps: number;
      IOMaximumBandwidth: number;
      MaskedPaths: string[];
      ReadonlyPaths: string[];
    };
    GraphDriver: {
      Data: object;
      Name: string;
    };
    Mounts: unknown[];
    Config: {
      Hostname: string;
      Domainname: string;
      User: string;
      AttachStdin: boolean;
      AttachStdout: boolean;
      AttachStderr: boolean;
      ExposedPorts: object;
      Tty: boolean;
      OpenStdin: boolean;
      StdinOnce: boolean;
      Env: string[];
      Cmd: string[];
      Image: string;
      Volumes: null | object;
      WorkingDir: string;
      Entrypoint: string[];
      OnBuild: null | string[];
      Labels: object;
    };
    NetworkSettings: {
      Bridge: string;
      SandboxID: string;
      SandboxKey: string;
      Ports: object;
      HairpinMode: boolean;
      LinkLocalIPv6Address: string;
      LinkLocalIPv6PrefixLen: number;
      SecondaryIPAddresses: null | object[];
      SecondaryIPv6Addresses: null | object[];
      EndpointID: string;
      Gateway: string;
      GlobalIPv6Address: string;
      GlobalIPv6PrefixLen: number;
      IPAddress: string;
      IPPrefixLen: number;
      IPv6Gateway: string;
      MacAddress: string;
      Networks: object;
    };
  };

interface DeviceConfig {
  PathOnHost: string;
  PathInContainer: string;
  CgroupPermissions: string;
}

interface BlkioWeightDevice {
  Path: string;
  Weight: number;
}

interface BlkioDeviceRate {
  Path: string;
  Rate: number;
}

interface DeviceRequest {
  Driver: string;
  Count: number;
  DeviceIDs: string[];
  Capabilities: string[][];
  Options: Record<string, string>;
}

interface Ulimit {
  Name: string;
  Soft: number;
  Hard: number;
}