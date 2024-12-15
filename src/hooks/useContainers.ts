import { useState, useEffect } from "react";
import { DockerContainer } from "@/types/docker";
import ignoredContainers from "../app/api/containers/ignored-containers.json";

export function useContainers() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  
  const nonIgnoredContainers = containers.filter(
    (container) => !ignoredContainers.ignoredContainers.includes(container.ID)
  );

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await fetch("/api/containers");
        const data = await response.json();
        if (data.success) {
          setContainers(data.containers);
        }
      } catch (error) {
        console.error("Failed to fetch containers:", error);
      }
    };

    fetchContainers();
    // Refresh container list every 5 seconds
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    containers: nonIgnoredContainers,
  };
}
