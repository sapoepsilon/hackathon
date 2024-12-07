import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DataType, InputConfig } from "@/components/ui/deploy-dialog";

export function useDeployment() {
  const { toast } = useToast();
  const [deploymentStatus, setDeploymentStatus] = useState("idle");
  const [containerDetails, setContainerDetails] = useState<{ containerId: string; url: string } | null>(null);

  const handleDeploy = async (code: string, inputs: InputConfig[], outputs: DataType, method: string) => {
    try {
      setDeploymentStatus("deploying");
      toast({
        description: "Building and deploying container...",
      });

      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, inputs, outputs, method }),
      });

      const data = await response.json(); 

      if (data.success) {
        setDeploymentStatus("deployed");
        setContainerDetails({
          containerId: data.containerId,
          url: data.url
        });
        toast({
          title: "Deployment Successful",
          description: `Container ${data.containerId} deployed successfully at ${data.url}`,
          variant: "default",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setDeploymentStatus("error");
      toast({
        title: "Deployment Failed",
        description:
          error instanceof Error ? error.message : "no error message provided",
        variant: "destructive",
      });
    }
  };

  return {
    deploymentStatus,
    handleDeploy,
    containerDetails,
  };
}
