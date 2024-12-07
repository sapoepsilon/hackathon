import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";

const DATA_TYPES = ["string", "json", "array", "number", "boolean"] as const;
export type DataType = (typeof DATA_TYPES)[number];

export interface InputConfig {
  id: string;
  type: DataType;
}

interface DeployDialogProps {
  onDeploy: (inputs: InputConfig[], output: DataType) => Promise<void>;
  trigger?: React.ReactNode;
}

export function DeployDialog({ onDeploy, trigger }: DeployDialogProps) {
  const [inputs, setInputs] = React.useState<InputConfig[]>([
    { id: crypto.randomUUID(), type: "string" },
  ]);
  const [output, setOutput] = React.useState<DataType>("string");
  const [open, setOpen] = React.useState(false);

  const handleDeploy = async () => {
    await onDeploy(inputs, output);
    setOpen(false);
  };

  const addInput = () => {
    setInputs([...inputs, { id: crypto.randomUUID(), type: "string" }]);
  };

  const removeInput = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter((input) => input.id !== id));
    }
  };

  const updateInputType = (id: string, type: DataType) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, type } : input))
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Deploy Container</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deploy Container</DialogTitle>
          <DialogDescription>
            Configure the input and output types for your container deployment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {inputs.map((input, index) => (
              <div
                key={input.id}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label className="text-right">Input {index + 1}</Label>
                <div className="col-span-3 flex gap-2">
                  <Select
                    value={input.type}
                    onValueChange={(type: DataType) =>
                      updateInputType(input.id, type)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select input type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInput(input.id)}
                    disabled={inputs.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addInput}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Input
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="output" className="text-right">
              Output Type
            </Label>
            <Select value={output} onValueChange={setOutput}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select output type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleDeploy}>Deploy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
