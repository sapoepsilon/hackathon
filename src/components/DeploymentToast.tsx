"use client";

import { useToast } from "@/hooks/use-toast";
import React from "react";

interface DeploymentToastProps {
  title?: string;
  message?: string;
  type?: "default" | "destructive" | null | undefined;
}

export const DeploymentToast: React.FC<DeploymentToastProps> = ({
  title = "Toast works!",
  message = undefined,
  type = "default",
}) => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      variant: type,
      title: title,
      description: message,
    });
  };

  React.useEffect(() => {
    showToast();
  }, []);

  return null;
};
