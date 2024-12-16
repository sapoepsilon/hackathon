import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/flow.css";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Node as NodeType } from "@xyflow/react";
import { FlowProvider, useFlowContext } from "./flow/FlowProvider";
import {
  ApiNode,
  CombinerNode,
  JSONInputNode,
  GroupNode,
} from "./flow/NodeTypes";
import { AddNodeDialog, ApiDialog, JsonDialog } from "./flow/DialogComponents";
import { FlowControls } from "./flow/FlowControls";

interface FlowCanvasProps {
  height?: string;
  width?: string;
}

// Define nodeTypes outside of any component
const nodeTypes = {
  api: (props: any) => <ApiNode {...props} />,
  combiner: CombinerNode,
  jsonInput: JSONInputNode,
  group: GroupNode,
};

function FlowCanvasContent({
  height = "75vh",
  width = "100%",
}: FlowCanvasProps): JSX.Element {
  const {
    nodes,
    edges,
    containers,
    isExecuting,
    onNodesChange,
    onEdgesChange,
    onConnect,
    executeApiNode,
    executeFlow,
    addNode,
    addCombinerNode,
    addJsonNode,
    updateCombinerNodes,
    setNodes,
    setEdges,
    saveFlow,
    loadFlow,
    savedFlows,
  } = useFlowContext();

  const { theme, systemTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState("");
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [selectedResponseNode, setSelectedResponseNode] =
    useState<NodeType | null>(null);
  const [apiInput, setApiInput] = useState("");
  const [inputType, setInputType] = useState<
    "string" | "number" | "json" | "array-number" | "array-string"
  >("string");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [selectedJsonPath, setSelectedJsonPath] = useState<string>("");
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    updateCombinerNodes();
  }, [edges, nodes]);

  const handleNodeClick = (event: React.MouseEvent, node: NodeType) => {
    if (node.type === "api") {
      setSelectedNode(node);
      setIsApiDialogOpen(true);
    } else if (node.type === "response" || node.data?.type === "response") {
      if (node.data?.output && typeof node.data.output === "object") {
        setSelectedResponseNode(node);
        setSelectedJsonPath("");
        setIsJsonDialogOpen(true);
      }
    }
  };

  const handleApiCall = async () => {
    if (!selectedNode?.id) return;

    try {
      // Update the selected node's input values
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  inputValues: {
                    input: apiInput
                      ? inputType === "json"
                        ? JSON.parse(apiInput)
                        : inputType === "array-number" ||
                          inputType === "array-string"
                        ? JSON.parse(apiInput)
                        : inputType === "number"
                        ? Number(apiInput)
                        : apiInput
                      : {},
                  },
                },
              }
            : n
        )
      );

      // Execute the API call
      await executeApiNode(selectedNode.id);

      // Close the dialog and reset input
      setIsApiDialogOpen(false);
      setApiInput("");
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };

  const getJsonPaths = (obj: any, parentPath = ""): string[] => {
    if (!obj || typeof obj !== "object") return [];

    return Object.entries(obj).reduce((paths: string[], [key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      paths.push(currentPath);

      if (value && typeof value === "object" && !Array.isArray(value)) {
        paths.push(...getJsonPaths(value, currentPath));
      }
      return paths;
    }, []);
  };

  const getValueFromPath = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const handleJsonValueSelect = () => {
    if (!selectedResponseNode || !selectedJsonPath) return;

    const value = getValueFromPath(
      selectedResponseNode.data.output,
      selectedJsonPath
    );

    const valueNode: NodeType = {
      id: `value-${Date.now()}`,
      type: "value",
      position: {
        x: (selectedResponseNode.position?.x || 0) + 200,
        y: selectedResponseNode.position?.y || 0,
      },
      data: {
        type: "value",
        label: `Value: ${selectedJsonPath}`,
        output: value,
        outputType: typeof value === "object" ? "json" : typeof value,
      },
    };

    setNodes((nds) => [...nds, valueNode]);

    setEdges((eds) => [
      ...eds,
      {
        id: `${selectedResponseNode.id}-${valueNode.id}`,
        source: selectedResponseNode.id,
        target: valueNode.id,
      },
    ]);

    setIsJsonDialogOpen(false);
  };

  return (
    <div className="relative" style={{ height, width }}>
      <FlowControls
        onAddNode={() => setIsDialogOpen(true)}
        onAddCombiner={addCombinerNode}
        onAddJson={addJsonNode}
        onExecuteFlow={executeFlow}
        isExecuting={isExecuting}
        onSaveFlow={() => setIsSaveDialogOpen(true)}
        onLoadFlow={() => setIsLoadDialogOpen(true)}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      <AddNodeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        containers={containers}
        onContainerSelect={addNode}
      />

      {/* Save Flow Dialog */}
      <dialog
        open={isSaveDialogOpen}
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => setIsSaveDialogOpen(false)}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Save Flow</h3>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Enter flow name"
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsSaveDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (flowName) {
                    await saveFlow(flowName);
                    setFlowName("");
                    setIsSaveDialogOpen(false);
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!flowName}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Load Flow Dialog */}
      <dialog
        open={isLoadDialogOpen}
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => setIsLoadDialogOpen(false)}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Load Flow</h3>
            <div className="max-h-96 overflow-y-auto">
              {savedFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="p-3 border-b hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={async () => {
                    await loadFlow(flow.id);
                    setIsLoadDialogOpen(false);
                  }}
                >
                  <div className="font-medium">{flow.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(flow.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsLoadDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <JsonDialog
        isOpen={isJsonDialogOpen}
        onOpenChange={setIsJsonDialogOpen}
        selectedJsonPath={selectedJsonPath}
        onJsonPathChange={setSelectedJsonPath}
        jsonPaths={
          selectedResponseNode?.data.output
            ? getJsonPaths(selectedResponseNode.data.output)
            : []
        }
        previewValue={
          selectedJsonPath && selectedResponseNode
            ? getValueFromPath(
                selectedResponseNode.data.output,
                selectedJsonPath
              )
            : null
        }
        onExtractValue={handleJsonValueSelect}
      />
    </div>
  );
}

export default function FlowCanvas(props: FlowCanvasProps): JSX.Element {
  return (
    <FlowProvider>
      <FlowCanvasContent {...props} />
    </FlowProvider>
  );
}
