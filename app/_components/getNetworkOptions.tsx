// components/NfaVisualizationCard.tsx
"use client";
import { COLOR_SCHEME } from "../_utils/visualization";

// Helper functions

export const getNetworkOptions = () => ({
  nodes: {
    shape: "circle",
    size: 25,
    font: {
      size: 14,
      face: "Inter, system-ui, sans-serif",
      color: "#ffffff",
      strokeWidth: 0,
    },
    borderWidth: 3,
    shadow: {
      enabled: true,
      color: "rgba(0,0,0,0.1)",
      size: 5,
      x: 0,
      y: 2,
    },
    chosen: {
      node: (values: any, id: string, selected: boolean, hovering: boolean) => {
        values.shadow = hovering;
        values.shadowSize = hovering ? 8 : 5;
        values.shadowColor = hovering ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)";
      },
    },
  },
  edges: {
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1.2,
        type: "arrow",
      },
    },
    color: {
      color: COLOR_SCHEME.edge.color,
      highlight: COLOR_SCHEME.edge.highlight,
      hover: COLOR_SCHEME.edge.hover,
    },
    font: {
      size: 12,
      face: "Inter, system-ui, sans-serif",
      background: "rgba(255,255,255,0.9)",
      strokeWidth: 0,
      color: "#374151",
    },
    labelHighlightBold: false,
    selectionWidth: 3,
    hoverWidth: 2,
    smooth: {
      enabled: true,
      type: "curvedCW",
      roundness: 0.2,
    },
    shadow: {
      enabled: false,
    },
  },
  physics: {
    enabled: true,
    solver: "forceAtlas2Based",
    forceAtlas2Based: {
      gravitationalConstant: -50,
      centralGravity: 0.01,
      springLength: 100,
      springConstant: 0.08,
      damping: 0.4,
      avoidOverlap: 1,
    },
    stabilization: {
      enabled: true,
      iterations: 200,
      updateInterval: 25,
    },
  },
  interaction: {
    hoverConnectedEdges: true,
    selectConnectedEdges: false,
    dragNodes: true,
    dragView: true,
    zoomView: true,
    tooltipDelay: 200,
  },
  layout: {
    improvedLayout: true,
    hierarchical: {
      enabled: false,
    },
  },
});
