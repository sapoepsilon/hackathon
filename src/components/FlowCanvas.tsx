import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/flow.css";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Node as NodeType } from "@xyflow/react";
import { FlowProvider, useFlowContext } from "./flow/FlowProvider";
import { ApiNode, CombinerNode } from "./flow/NodeTypes";
import { AddNodeDialog, ApiDialog, JsonDialog } from "./flow/DialogComponents";
import { FlowControls } from "./flow/FlowControls";

interface FlowCanvasProps {
  height?: string;
  width?: string;
}

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
    updateCombinerNodes,
    setNodes,
    setEdges,
  } = useFlowContext();

  const { theme, systemTheme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      // Create a response node
      const responseNode: NodeType = {
        id: `response-${Date.now()}`,
        type: "response",
        position: {
          x: selectedNode.position.x + 200,
          y: selectedNode.position.y,
        },
        data: {
          type: "response",
          label: "Response",
          output: null,
          outputType: "json",
        },
      };

      // Add response node first
      setNodes((nds) => [...nds, responseNode]);

      // Connect API node to response node
      setEdges((eds) => [
        ...eds,
        {
          id: `${selectedNode.id}-${responseNode.id}`,
          source: selectedNode.id,
          target: responseNode.id,
        },
      ]);

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

  const nodeTypes = useMemo(
    () => ({
      api: (props: any) => {
        console.log("API node props:", props); // Debug log
        return (
          <ApiNode
            {...props}
            isExecuting={isExecuting}
            onExecute={(id: string) => {
              console.log("Execute called with id:", id); // Debug log
              const node = nodes.find((n) => n.id === id);
              if (!node) {
                console.error("Node not found:", id);
                return;
              }

              // Create a response node
              const responseNode: NodeType = {
                id: `response-${Date.now()}`,
                type: "response",
                position: {
                  x: node.position.x + 200,
                  y: node.position.y,
                },
                data: {
                  type: "response",
                  label: "Response",
                  output: null,
                  outputType: "json",
                },
              };

              // Add response node first
              setNodes((nds) => [...nds, responseNode]);

              // Connect API node to response node
              setEdges((eds) => [
                ...eds,
                {
                  id: `${id}-${responseNode.id}`,
                  source: id,
                  target: responseNode.id,
                },
              ]);

              // Execute the API call
              executeApiNode(id);
            }}
          />
        );
      },
      combiner: CombinerNode,
      response: (props: any) => (
        <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          <div className="font-bold">Response</div>
          <div className="text-sm mt-2 max-w-[200px] overflow-hidden text-ellipsis">
            {props.data.output ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(props.data.output, null, 2)}
              </pre>
            ) : (
              "Waiting for response..."
            )}
          </div>
          <Handle type="source" position={Position.Right} id="output" />
        </div>
      ),
    }),
    [isExecuting, nodes, executeApiNode, setNodes, setEdges]
  );

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
        onExecuteFlow={executeFlow}
        isExecuting={isExecuting}
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

      <ApiDialog
        isOpen={isApiDialogOpen}
        onOpenChange={setIsApiDialogOpen}
        inputType={inputType}
        onInputTypeChange={setInputType}
        apiInput={apiInput}
        onApiInputChange={setApiInput}
        onApiCall={handleApiCall}
      />

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
