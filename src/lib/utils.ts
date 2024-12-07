import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Edge, Node } from "@xyflow/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  // Create a map of node dependencies
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize the graph and in-degree count
  nodes.forEach(node => {
    graph.set(node.id, new Set());
    inDegree.set(node.id, 0);
  });

  // Build the graph and count in-degrees
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    if (graph.has(source) && graph.has(target)) {
      graph.get(source)?.add(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    }
  });

  // Initialize queue with nodes that have no dependencies
  const queue: string[] = [];
  nodes.forEach(node => {
    if ((inDegree.get(node.id) || 0) === 0) {
      queue.push(node.id);
    }
  });

  // Process the queue
  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    // Reduce in-degree for all dependent nodes
    graph.get(nodeId)?.forEach(dependent => {
      inDegree.set(dependent, (inDegree.get(dependent) || 0) - 1);
      if (inDegree.get(dependent) === 0) {
        queue.push(dependent);
      }
    });
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error("Graph contains a cycle");
  }

  // Return nodes in sorted order
  return result.map(id => nodes.find(node => node.id === id)!);
}
