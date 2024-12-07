"use client";

import { ReactFlow, Background, Controls } from "@xyflow/react";
import { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@/styles/flow.css";
import { useFlow } from "../hooks/useFlow";
import { useTheme } from "next-themes";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
    type: "input",
  },
  {
    id: "2",
    position: { x: 300, y: 100 },
    data: { label: "Node 2" },
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

interface FlowCanvasProps {
  height?: string;
  width?: string;
}

export default function FlowCanvas({ height = "75vh", width = "100%" }: FlowCanvasProps): JSX.Element {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlow(
    initialNodes,
    initialEdges
  );
  const { theme } = useTheme();

  return (
    <div style={{ width, height, position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
        className={theme === 'dark' ? 'react-flow-dark' : 'react-flow-light'}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
