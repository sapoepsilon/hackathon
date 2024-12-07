import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Deployment } from "@/types/deployment";

interface AddNodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  containers: Deployment[];
  onContainerSelect: (container: Deployment) => void;
}

export const AddNodeDialog = ({
  isOpen,
  onOpenChange,
  containers,
  onContainerSelect,
}: AddNodeDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Node</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        {containers.map((container) => (
          <Button
            key={container.id}
            variant="outline"
            onClick={() => onContainerSelect(container)}
          >
            {container.url}
          </Button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

interface ApiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inputType: "string" | "number" | "json" | "array-number" | "array-string";
  onInputTypeChange: (
    value: "string" | "number" | "json" | "array-number" | "array-string"
  ) => void;
  apiInput: string;
  onApiInputChange: (value: string) => void;
  onApiCall: () => void;
}

export const ApiDialog = ({
  isOpen,
  onOpenChange,
  inputType,
  onInputTypeChange,
  apiInput,
  onApiInputChange,
  onApiCall,
}: ApiDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Call API Node</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label>Input Type</label>
          <Select value={inputType} onValueChange={onInputTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select input type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="array-number">Array of Numbers</SelectItem>
              <SelectItem value="array-string">Array of Strings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label>Input (optional)</label>
          <Input
            value={apiInput}
            onChange={(e) => {
              const value = e.target.value;
              if (inputType === "number") {
                if (value === "" || !isNaN(Number(value))) {
                  onApiInputChange(value);
                }
              } else {
                onApiInputChange(value);
              }
            }}
            type={inputType === "number" ? "number" : "text"}
            placeholder={`Enter ${
              inputType === "json"
                ? "JSON input"
                : inputType === "array-number"
                ? "numbers (e.g., [1,2,3])"
                : inputType === "array-string"
                ? "strings (e.g., ['a','b','c'])"
                : inputType
            } input`}
          />
        </div>
        <Button onClick={onApiCall}>Call API</Button>
      </div>
    </DialogContent>
  </Dialog>
);

interface JsonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJsonPath: string;
  onJsonPathChange: (value: string) => void;
  jsonPaths: string[];
  previewValue: any;
  onExtractValue: () => void;
}

export const JsonDialog = ({
  isOpen,
  onOpenChange,
  selectedJsonPath,
  onJsonPathChange,
  jsonPaths,
  previewValue,
  onExtractValue,
}: JsonDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select JSON Value</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label>Available Paths</label>
          <Select value={selectedJsonPath} onValueChange={onJsonPathChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>
            <SelectContent>
              {jsonPaths.map((path) => (
                <SelectItem key={path} value={path}>
                  {path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label>Preview</label>
          <pre className="bg-secondary p-2 rounded text-xs">
            {selectedJsonPath
              ? JSON.stringify(previewValue, null, 2)
              : "Select a path to preview value"}
          </pre>
        </div>
        <Button onClick={onExtractValue}>Extract Value</Button>
      </div>
    </DialogContent>
  </Dialog>
);
