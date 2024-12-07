import { Handle, Position } from "@xyflow/react";
import { Button } from "../ui/button";
import { Copy, Check, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { ApiDialog } from "./DialogComponents";
import { useFlowContext } from "./FlowProvider";

interface ApiNodeData {
  id: string;
  type: string;
  label: string;
  containerId: string;
  deploymentUrl: string;
  method: string;
  inputs?: Array<{ id: string; type: string }>;
  outputType?: string;
  inputValues?: Record<string, any>;
  output?: any;
  selectedFields?: Array<{ field: string; valueOnly: boolean }>;
}

interface ApiNodeProps {
  id: string;
  data: ApiNodeData;
}

export const ApiNode = ({ id, data }: ApiNodeProps) => {
  const { executeApiNode, isExecuting } = useFlowContext();
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [apiInput, setApiInput] = useState("");

  const handleApiCall = () => {
    setIsApiDialogOpen(false);
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeApiNode(id);
  };

  const getNestedFields = (obj: any, prefix = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];

    return Object.entries(obj).reduce((fields: string[], [key, value]) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return [...fields, currentPath, ...getNestedFields(value, currentPath)];
      }

      return [...fields, currentPath];
    }, []);
  };

  const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const filterOutput = (output: any) => {
    if (!output || !data.selectedFields?.length) return output;
    const selectedField = data.selectedFields[0].field;

    if (Array.isArray(output)) {
      return output.map((item) => getValueByPath(item, selectedField));
    } else if (typeof output === "object") {
      return getValueByPath(output, selectedField);
    }
    return output;
  };

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopy = () => {
    const outputText = JSON.stringify(filterOutput(data.output), null, 2);
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filterFields = (fields: string[]) => {
    if (!searchQuery) return fields;
    return fields.filter((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-background border border-border min-w-[320px] max-w-[500px]">
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="font-bold text-sm truncate">{data.label}</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsApiDialogOpen(true)}
            className="shrink-0"
          >
            API
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExecute}
            disabled={isExecuting}
            className="shrink-0"
          >
            {isExecuting ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <ApiDialog
        isOpen={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
        inputType={inputType}
        onInputTypeChange={setInputType}
        apiInput={apiInput}
        onApiInputChange={setApiInput}
        onApiCall={handleApiCall}
      />

      {/* Input handles */}
      <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around">
        {data.inputs?.map((input) => (
          <div key={input.id} className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground whitespace-nowrap bg-background/80 px-1.5 py-0.5 rounded">
              in: {input.type}
            </div>
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className="!w-3 !h-3"
              style={{ background: "var(--border)" }}
            />
          </div>
        ))}
      </div>

      {/* Output handle */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-[1]">
        <div className="text-xs text-muted-foreground whitespace-nowrap bg-background/80 px-1.5 py-0.5 rounded">
          out: {data.outputType}
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-3 !h-3"
          style={{ background: "var(--border)" }}
        />
      </div>

      {/* Display input values if any */}
      {data.inputValues && Object.entries(data.inputValues).length > 0 && (
        <div className="mt-4 text-xs space-y-1">
          <div className="font-semibold text-foreground/80">Inputs:</div>
          <div className="space-y-1 bg-muted/30 rounded-md p-2">
            {Object.entries(data.inputValues).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-foreground/70">{key}:</span>
                <span className="text-foreground/60 break-all">
                  {JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display output if any */}
      {data.output && (
        <div className="mt-4 text-xs space-y-1">
          <div className="font-semibold text-foreground/80 flex items-center justify-between">
            <span>Output:</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <div className="mb-2 space-y-1">
            <div className="font-medium text-foreground/70">Select fields:</div>
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto bg-muted/30 rounded-md p-2">
              {filterFields(
                getNestedFields(
                  Array.isArray(data.output)
                    ? data.output[0] || {}
                    : data.output || {}
                )
              ).map((field) => {
                const isSelected = data.selectedFields?.[0]?.field === field;
                const value = getValueByPath(
                  Array.isArray(data.output) ? data.output[0] : data.output,
                  field
                );
                const displayValue =
                  typeof value === "object"
                    ? "Object"
                    : String(value).slice(0, 50) +
                      (String(value).length > 50 ? "..." : "");

                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 hover:bg-muted/20 p-1 rounded"
                  >
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="radio"
                        name={`field-selection-${id}`}
                        checked={isSelected}
                        onChange={() => {
                          data.selectedFields = [{ field, valueOnly: false }];
                        }}
                      />
                      <span className="flex-1">{field}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {displayValue}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          <pre className="bg-muted p-2 rounded-md overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            {JSON.stringify(filterOutput(data.output), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

interface CombinerNodeData {
  input1?: any;
  input2?: any;
  combined?: any;
  selectedFields?: Array<{ field: string; valueOnly: boolean }>;
}

interface CombinerNodeProps {
  data: CombinerNodeData;
}

export const CombinerNode = ({ data }: CombinerNodeProps) => {
  const getNestedFields = (obj: any, prefix = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];

    return Object.entries(obj).reduce((fields: string[], [key, value]) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        return [...fields, currentPath, ...getNestedFields(value, currentPath)];
      }

      return [...fields, currentPath];
    }, []);
  };

  const getValueByPath = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const filterOutput = (output: any) => {
    if (!output || !data.selectedFields?.length) return output;
    const selectedField = data.selectedFields[0].field;

    if (Array.isArray(output)) {
      return output.map((item) => getValueByPath(item, selectedField));
    } else if (typeof output === "object") {
      return getValueByPath(output, selectedField);
    }
    return output;
  };

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
      <div className="font-bold">JSON Combiner</div>
      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        style={{ top: "40%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        style={{ top: "60%" }}
      />
      <div className="space-y-2">
        {/* Field selector */}
        {data.combined && (
          <div className="text-xs space-y-1">
            <div className="font-medium text-foreground/70">Select fields:</div>
            <div className="max-h-[100px] overflow-y-auto bg-muted/30 rounded-md p-2">
              {getNestedFields(
                Array.isArray(data.combined)
                  ? data.combined[0] || {}
                  : data.combined || {}
              ).map((field) => {
                const isSelected = data.selectedFields?.[0]?.field === field;
                const value = getValueByPath(
                  Array.isArray(data.combined)
                    ? data.combined[0]
                    : data.combined,
                  field
                );
                const displayValue =
                  typeof value === "object"
                    ? "Object"
                    : String(value).slice(0, 50) +
                      (String(value).length > 50 ? "..." : "");

                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 hover:bg-muted/20 p-1 rounded"
                  >
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="radio"
                        name={`field-selection`}
                        checked={isSelected}
                        onChange={() => {
                          data.selectedFields = [{ field, valueOnly: false }];
                        }}
                      />
                      <span className="flex-1">{field}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {displayValue}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Output preview */}
        <div className="text-xs space-y-1">
          <pre className="bg-muted/30 p-2 rounded-md overflow-x-auto max-h-[100px] text-[10px]">
            {data.combined
              ? JSON.stringify(filterOutput(data.combined), null, 2)
              : "Connect both inputs"}
          </pre>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-type="json"
      />
    </div>
  );
};
