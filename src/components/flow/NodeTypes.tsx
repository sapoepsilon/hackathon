import { Handle, Position } from "@xyflow/react";
import { Button } from "../ui/button";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
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
}

interface ApiNodeProps {
  id: string;
  data: ApiNodeData;
}

// Utility functions for handling JSON fields
const getNestedFields = (obj: any, prefix = ""): string[] => {
  if (!obj || typeof obj !== "object") return [];

  const fields: string[] = [];

  // Add the current path if it's not empty
  if (prefix) {
    fields.push(prefix);
  }

  for (const key in obj) {
    const value = obj[key];
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    // Add the current field
    fields.push(newPrefix);

    // If the value is an object or array, recursively get its fields
    if (value && typeof value === "object" && !Array.isArray(value)) {
      fields.push(...getNestedFields(value, newPrefix));
    }
  }

  return fields;
};

const getValueByPath = (obj: any, path: string): any => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

const getDisplayValue = (value: any): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const ApiNode = ({ id, data }: ApiNodeProps) => {
  const { executeApiNode, isExecuting } = useFlowContext();
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [apiInput, setApiInput] = useState("");

  const handleApiCall = () => {
    setIsApiDialogOpen(false);
    // Parse and set input values based on type
    try {
      let parsedInput;
      if (inputType === "json") {
        parsedInput = apiInput ? JSON.parse(apiInput) : undefined;
      } else if (inputType === "number") {
        parsedInput = apiInput ? Number(apiInput) : undefined;
      } else if (inputType === "array-number") {
        parsedInput = apiInput ? apiInput.split(",").map(Number) : undefined;
      } else if (inputType === "array-string") {
        parsedInput = apiInput ? apiInput.split(",") : undefined;
      } else {
        parsedInput = apiInput;
      }
      data.inputValues = parsedInput ? { input: parsedInput } : undefined;
    } catch (error) {
      console.error("Failed to parse input:", error);
    }
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeApiNode(id);
  };

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopy = () => {
    const outputText = JSON.stringify(data.output, null, 2);
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
            Input
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
        {data.inputs?.map((input, index) => (
          <div key={`${input.id}-${index}`} className="flex items-center gap-2">
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
          <div className="font-semibold text-foreground/80">Input:</div>
          <pre className="bg-muted p-2 rounded-md overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            {JSON.stringify(data.inputValues, null, 2)}
          </pre>
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
          <pre className="bg-muted p-2 rounded-md overflow-x-auto max-h-[200px] scrollbar-thin scrollbar-thumb-border scrollbar-track-background">
            {JSON.stringify(data.output, null, 2)}
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
                const displayValue = getDisplayValue(value);

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
              ? JSON.stringify(data.combined, null, 2)
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

interface JSONInputNodeData {
  id: string;
  jsonInput?: any;
  inputJson?: any;
  selectedFields?: Array<{ field: string; valueOnly: boolean }>;
  output?: any;
  outputType?: string;
  isStringMode?: boolean;
}

interface JSONInputNodeProps {
  data: JSONInputNodeData;
}

export const JSONInputNode = ({ data }: JSONInputNodeProps) => {
  const [isStringMode, setIsStringMode] = useState(data.isStringMode ?? false);
  const [error, setError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [manualInput, setManualInput] = useState(true);
  const [outputData, setOutputData] = useState<any>(null);

  // Update node data when string mode changes
  useEffect(() => {
    data.isStringMode = isStringMode;
    data.outputType = isStringMode ? "string" : "json";
  }, [isStringMode, data]);

  const handleJsonInput = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setJsonText(value);
      data.jsonInput = parsed;
      updateOutputData(parsed);
      setError("");
      setManualInput(true);
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  const convertToString = () => {
    try {
      if (data.jsonInput) {
        const stringValue = JSON.stringify(data.jsonInput, null, 2);
        setOutputData(stringValue);
        data.output = stringValue;
      }
    } catch (e) {
      setError("Error converting to string");
    }
  };

  const updateOutputData = (input: any) => {
    if (isStringMode) {
      const stringValue = JSON.stringify(input, null, 2);
      setOutputData(stringValue);
      data.output = stringValue;
    } else if (data.selectedFields?.[0]?.field) {
      const selectedValue = getValueByPath(input, data.selectedFields[0].field);
      setOutputData(selectedValue);
      data.output = selectedValue;
    } else {
      setOutputData(input);
      data.output = input;
    }
  };

  useEffect(() => {
    if (data.jsonInput && !manualInput) {
      try {
        const formattedJson = JSON.stringify(data.jsonInput, null, 2);
        setJsonText(formattedJson);
        updateOutputData(data.jsonInput);
        setError("");
      } catch (e) {
        setError("Invalid JSON from input");
      }
    }
  }, [data.jsonInput, manualInput]);

  useEffect(() => {
    if (data.jsonInput) {
      updateOutputData(data.jsonInput);
    }
  }, [data.selectedFields]);

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-background border border-border">
      <div className="font-bold text-sm">JSON Filter</div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        data-type="json"
        onConnect={() => setManualInput(false)}
      />
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="sm"
            variant={isStringMode ? "default" : "outline"}
            onClick={() => {
              setIsStringMode(!isStringMode);
              if (data.jsonInput) {
                updateOutputData(data.jsonInput);
              }
            }}
          >
            {isStringMode ? "String Mode" : "JSON Mode"}
          </Button>
        </div>

        {data.jsonInput && (
          <div className="text-xs space-y-1">
            <div className="font-medium text-foreground/70">Select fields:</div>
            <div className="max-h-[100px] overflow-y-auto bg-muted/30 rounded-md p-2">
              {getNestedFields(data.jsonInput).map((field) => {
                const isSelected = data.selectedFields?.[0]?.field === field;
                const value = getValueByPath(data.jsonInput, field);
                const displayValue = getDisplayValue(value);

                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 hover:bg-muted/20 p-1 rounded"
                  >
                    <label className="flex items-center gap-2 flex-1">
                      <input
                        type="radio"
                        name="json-field-selection"
                        checked={isSelected}
                        onChange={() => {
                          data.selectedFields = [{ field, valueOnly: false }];
                          updateOutputData(data.jsonInput);
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
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        data-type={isStringMode ? "string" : "json"}
        data={
          isStringMode
            ? typeof outputData === "string"
              ? outputData
              : JSON.stringify(outputData)
            : data.selectedFields?.[0]?.field
            ? {
                [data.selectedFields[0].field]: getValueByPath(
                  data.jsonInput,
                  data.selectedFields[0].field
                ),
              }
            : data.jsonInput
        }
      />
    </div>
  );
};

interface GroupNodeData {
  label: string;
  isExpanded: boolean;
  childNodes: string[];
  originalEdges: Edge[];
}

interface GroupNodeProps {
  data: GroupNodeData;
}

export const GroupNode = ({ data }: GroupNodeProps) => {
  const { nodes, edges, setNodes, setEdges } = useFlowContext();

  // Get all connections to and from the group's child nodes
  const groupConnections = edges.filter(
    (edge) =>
      data.childNodes.includes(edge.source) ||
      data.childNodes.includes(edge.target)
  );

  // Get external nodes that connect to this group
  const externalConnections = {
    inputs: [
      ...new Set(
        groupConnections
          .filter((edge) => !data.childNodes.includes(edge.source))
          .map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            return sourceNode?.data?.label || sourceNode?.id;
          })
      ),
    ],
    outputs: [
      ...new Set(
        groupConnections
          .filter((edge) => !data.childNodes.includes(edge.target))
          .map((edge) => {
            const targetNode = nodes.find((n) => n.id === edge.target);
            return targetNode?.data?.label || targetNode?.id;
          })
      ),
    ],
  };

  const toggleExpand = () => {
    const groupId = nodes.find(
      (n) => n.type === "group" && n.data.childNodes === data.childNodes
    )?.id;

    if (data.isExpanded) {
      // Collapsing: Hide child nodes and restore group edges
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          hidden: data.childNodes.includes(node.id),
        }))
      );

      // Remove original edges and add group edges
      const externalConnections = data.originalEdges.filter(
        (edge) =>
          (data.childNodes.includes(edge.source) &&
            !data.childNodes.includes(edge.target)) ||
          (!data.childNodes.includes(edge.source) &&
            data.childNodes.includes(edge.target))
      );

      const groupEdges = externalConnections.map((edge) => {
        const isSource = data.childNodes.includes(edge.source);
        return {
          id: `group-edge-${Date.now()}-${Math.random()}`,
          source: isSource ? groupId! : edge.source,
          target: isSource ? edge.target : groupId!,
          type: edge.type,
          data: edge.data,
        };
      });

      setEdges((prevEdges) => [
        ...prevEdges.filter(
          (edge) => !data.originalEdges.some((oe) => oe.id === edge.id)
        ),
        ...groupEdges,
      ]);
    } else {
      // Expanding: Show child nodes and restore original edges
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          hidden: false,
        }))
      );

      // Remove group edges and restore original edges
      setEdges((prevEdges) => [
        ...prevEdges.filter(
          (edge) => !(edge.source === groupId || edge.target === groupId)
        ),
        ...data.originalEdges,
      ]);
    }

    // Update the group node's expanded state
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.type === "group"
          ? { ...node, data: { ...node.data, isExpanded: !data.isExpanded } }
          : node
      )
    );
  };

  return (
    <div className="relative p-4 shadow-lg rounded-lg bg-background border border-border min-w-[320px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="font-bold text-sm truncate">{data.label}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleExpand}
              className="shrink-0"
            >
              {data.isExpanded ? "-" : "+"}
            </Button>
            <span className="text-xs text-muted-foreground">
              ({data.childNodes.length} nodes)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {externalConnections.inputs.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                Inputs from:
              </span>
              <div className="flex flex-wrap gap-1">
                {externalConnections.inputs.map((input, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted rounded-md text-xs"
                  >
                    {input}
                  </span>
                ))}
              </div>
            </div>
          )}

          {externalConnections.outputs.length > 0 && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                Outputs to:
              </span>
              <div className="flex flex-wrap gap-1">
                {externalConnections.outputs.map((output, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted rounded-md text-xs"
                  >
                    {output}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3"
        style={{ background: "var(--border)" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3"
        style={{ background: "var(--border)" }}
      />
    </div>
  );
};
