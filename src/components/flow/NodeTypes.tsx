import { Handle, Position } from "@xyflow/react";
import { Button } from "../ui/button";

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
  isExecuting: boolean;
  onExecute: (id: string) => void;
}

export const ApiNode = ({ id, data, isExecuting, onExecute }: ApiNodeProps) => {
  console.log("ApiNode props:", { id, data, isExecuting }); // Debug log

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Execute clicked for node:", id); // Debug log
    onExecute(id);
  };

  const filterOutput = (output: any) => {
    if (!output || !data.selectedFields?.length) return output;

    if (Array.isArray(output)) {
      return output.map((item) => {
        if (data.selectedFields?.every((f) => f.valueOnly)) {
          // If all selected fields are value-only, return array of values
          return data.selectedFields.map((f) => item[f.field]);
        }
        const filtered: any = {};
        data.selectedFields?.forEach(({ field, valueOnly }) => {
          if (field in item) {
            if (valueOnly) {
              return item[field];
            }
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    } else if (typeof output === "object") {
      if (data.selectedFields?.every((f) => f.valueOnly)) {
        // If all selected fields are value-only, return array of values
        return data.selectedFields.map((f) => output[f.field]);
      }
      const filtered: any = {};
      data.selectedFields?.forEach(({ field, valueOnly }) => {
        if (field in output) {
          if (valueOnly && data.selectedFields?.length === 1) {
            return output[field];
          }
          filtered[field] = output[field];
        }
      });
      return filtered;
    }
    return output;
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-background border border-border min-w-[280px] max-w-[400px]">
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="font-bold text-sm truncate">{data.label}</div>
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
          <div className="font-semibold text-foreground/80">Output:</div>
          <div className="mb-2 space-y-1">
            <div className="font-medium text-foreground/70">Select fields:</div>
            <div className="max-h-[100px] overflow-y-auto bg-muted/30 rounded-md p-2">
              {Object.keys(
                Array.isArray(data.output)
                  ? data.output[0] || {}
                  : data.output || {}
              ).map((field) => {
                const fieldConfig = data.selectedFields?.find(
                  (f) => f.field === field
                );
                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 hover:bg-muted/20 p-1 rounded"
                  >
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={!!fieldConfig}
                        onChange={(e) => {
                          const newFields = e.target.checked
                            ? [
                                ...(data.selectedFields || []),
                                { field, valueOnly: false },
                              ]
                            : (data.selectedFields || []).filter(
                                (f) => f.field !== field
                              );
                          data.selectedFields = newFields;
                        }}
                      />
                      <span>{field}</span>
                    </label>
                    {fieldConfig && (
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="rounded scale-75"
                          checked={fieldConfig.valueOnly}
                          onChange={(e) => {
                            const newFields = (data.selectedFields || []).map(
                              (f) =>
                                f.field === field
                                  ? { ...f, valueOnly: e.target.checked }
                                  : f
                            );
                            data.selectedFields = newFields;
                          }}
                        />
                        value only
                      </label>
                    )}
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
  const filterOutput = (output: any) => {
    if (!output || !data.selectedFields?.length) return output;

    if (Array.isArray(output)) {
      return output.map((item) => {
        if (data.selectedFields?.every((f) => f.valueOnly)) {
          return data.selectedFields.map((f) => item[f.field]);
        }
        const filtered: any = {};
        data.selectedFields?.forEach(({ field, valueOnly }) => {
          if (field in item) {
            if (valueOnly) {
              return item[field];
            }
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    } else if (typeof output === "object") {
      if (data.selectedFields?.every((f) => f.valueOnly)) {
        return data.selectedFields.map((f) => output[f.field]);
      }
      const filtered: any = {};
      data.selectedFields?.forEach(({ field, valueOnly }) => {
        if (field in output) {
          if (valueOnly && data.selectedFields?.length === 1) {
            return output[field];
          }
          filtered[field] = output[field];
        }
      });
      return filtered;
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
              {Object.keys(
                Array.isArray(data.combined)
                  ? data.combined[0] || {}
                  : data.combined || {}
              ).map((field) => {
                const fieldConfig = data.selectedFields?.find(
                  (f) => f.field === field
                );
                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 hover:bg-muted/20 p-1 rounded"
                  >
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={!!fieldConfig}
                        onChange={(e) => {
                          const newFields = e.target.checked
                            ? [
                                ...(data.selectedFields || []),
                                { field, valueOnly: false },
                              ]
                            : (data.selectedFields || []).filter(
                                (f) => f.field !== field
                              );
                          data.selectedFields = newFields;
                        }}
                      />
                      <span>{field}</span>
                    </label>
                    {fieldConfig && (
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="rounded scale-75"
                          checked={fieldConfig.valueOnly}
                          onChange={(e) => {
                            const newFields = (data.selectedFields || []).map(
                              (f) =>
                                f.field === field
                                  ? { ...f, valueOnly: e.target.checked }
                                  : f
                            );
                            data.selectedFields = newFields;
                          }}
                        />
                        value only
                      </label>
                    )}
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
