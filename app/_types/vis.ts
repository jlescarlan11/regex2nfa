// types/vis.ts
import type { IdType, Node, Edge } from "vis-network/standalone";

// Define the type for node updates, including the shadow property
// This is used for highlighting nodes in the vis-network graph.
export type NodeUpdateData = {
  id: IdType;
  color?: Node["color"]; // Use vis-network's own Color type
  borderWidth?: number;
  shadow?: Node["shadow"]; // Use vis-network's own Shadow type
};

// Original colors are stored to revert highlighting
export type OriginalNodeColors = Map<IdType, Node["color"] | undefined>;

// You might also want to define types for the data structure used by vis-network
export interface VisNode extends Node {
  id: IdType;
  label?: string;
  title?: string; // Tooltip
  // Add other vis-network node properties as needed
}

export interface VisEdge extends Edge {
  id?: IdType; // Optional for vis-network, it can auto-generate
  from: IdType;
  to: IdType;
  label?: string;
  title?: string; // Tooltip
  // Add other vis-network edge properties as needed
}
