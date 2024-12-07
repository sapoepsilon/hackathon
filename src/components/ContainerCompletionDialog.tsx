import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DeploymentInput, DeploymentOutput } from "@/types/deployment-config";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Plus, Trash2 } from "lucide-react";
import { createDeploymentConfig } from "@/app/actions/deployment-config";

interface ContainerCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  port: string;
  containerId: string;
}

export function ContainerCompletionDialog({
  open,
  onOpenChange,
  containerId,
  port,
}: ContainerCompletionDialogProps) {
  const [inputs, setInputs] = useState<DeploymentInput[]>([]);
  const [outputs, setOutputs] = useState<DeploymentOutput[]>([]);

  const addInput = () => {
    setInputs([
      ...inputs,
      {
        name: "",
        type: "string",
        required: false,
      },
    ]);
  };

  const addOutput = () => {
    setOutputs([
      ...outputs,
      {
        name: "",
        type: "string",
      },
    ]);
  };

  const removeInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const removeOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const updateInput = (
    index: number,
    field: keyof DeploymentInput,
    value: unknown
  ) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setInputs(newInputs);
  };

  const updateOutput = (
    index: number,
    field: keyof DeploymentOutput,
    value: unknown
  ) => {
    const newOutputs = [...outputs];
    newOutputs[index] = { ...newOutputs[index], [field]: value };
    setOutputs(newOutputs);
  };

  const handleSubmit = async () => {
    try {
      const result = await createDeploymentConfig(
        containerId,
        // port,
        inputs,
        outputs
      );

      if (!result.success) {
        console.error("Failed to upload config:", result.error);
        // You might want to show an error toast here
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading config:", error);
      // You might want to show an error toast here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Container Details</DialogTitle>
          <DialogDescription>
            Configure your container deployment settings
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm">Container ID:</span>
            <code className="col-span-3 bg-muted p-2 rounded text-sm">
              {containerId}
            </code>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm">External Port:</span>
            <code className="col-span-3 bg-muted p-2 rounded text-sm">
              {port}
            </code>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Inputs</h4>
              <Button variant="outline" size="sm" onClick={addInput}>
                <Plus className="h-4 w-4 mr-2" />
                Add Input
              </Button>
            </div>
            {inputs.map((input, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-3"
                  placeholder="Name"
                  value={input.name}
                  onChange={(e) => updateInput(index, "name", e.target.value)}
                />
                <Select
                  value={input.type}
                  onValueChange={(value) => updateInput(index, "type", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="col-span-4"
                  placeholder="Default value"
                  value={input.default_value || ""}
                  onChange={(e) =>
                    updateInput(index, "default_value", e.target.value)
                  }
                />
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={input.required}
                    onChange={(e) =>
                      updateInput(index, "required", e.target.checked)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="col-span-1"
                  onClick={() => removeInput(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Outputs</h4>
              <Button variant="outline" size="sm" onClick={addOutput}>
                <Plus className="h-4 w-4 mr-2" />
                Add Output
              </Button>
            </div>
            {outputs.map((output, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <Input
                  className="col-span-4"
                  placeholder="Name"
                  value={output.name}
                  onChange={(e) => updateOutput(index, "name", e.target.value)}
                />
                <Select
                  value={output.type}
                  onValueChange={(value) => updateOutput(index, "type", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="col-span-4"
                  placeholder="Description"
                  value={output.description || ""}
                  onChange={(e) =>
                    updateOutput(index, "description", e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="col-span-1"
                  onClick={() => removeOutput(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save to Supabase</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
