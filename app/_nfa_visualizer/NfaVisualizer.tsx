// components/NfaVisualizer.tsx
"use client";

import type { State, Transition } from "@/app/_types/nfa";
import { Box } from "@radix-ui/themes";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataSet, Network, Options } from "vis-network/standalone";

import type {
  NodeUpdateData,
  OriginalNodeColors,
  VisEdge,
  VisNode,
} from "@/app/_types/vis";

// Import sub-components
import { VisualizationCanvas } from "./VisualizationCanvas";
import { VisualizationStats } from "./VisualizationStats";
import { VisualizationToolbar } from "./VisualizationToolbar";

interface NfaVisualizerProps {
  nfa: { start: State; end: State; transitions: Transition[] } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  networkRef?: React.RefObject<Network | null>;
  onResetLayout: () => void;
  className?: string;
  externalFullscreen?: boolean;
  onToggleFullscreen: () => void;
}

// Define color scheme - Copy from app/page.tsx
const COLORS = {
  // Start state colors (blue)
  start: {
    background: "#3b82f6", // blue-500
    border: "#2563eb", // blue-600
    highlight: "#1d4ed8", // blue-700
    hover: "#1e40af", // blue-800
  },
  // Accept state colors (green)
  accept: {
    background: "#10b981", // emerald-500
    border: "#059669", // emerald-600
    highlight: "#047857", // emerald-700
    hover: "#065f46", // emerald-800
  },
  // Regular state colors (gray)
  regular: {
    background: "#6b7280", // gray-500
    border: "#4b5563", // gray-600
    highlight: "#374151", // gray-700
    hover: "#1f2937", // gray-800
  },
  // Active state colors (yellow/amber)
  active: {
    background: "#f59e0b", // amber-500
    border: "#d97706", // amber-600
    highlight: "#b45309", // amber-700
    hover: "#92400e", // amber-800
  },
  // Edge colors
  edges: {
    default: "#9ca3af", // gray-400
    epsilon: "#8b5cf6", // violet-500
    a: "#ef4444", // red-500
    b: "#3b82f6", // blue-500
    c: "#06b6d4", // cyan-500
    highlight: "#f59e0b", // amber-500
    hover: "#fbbf24", // amber-400
  },
  // Text colors
  text: {
    light: "#f9fafb", // gray-50
    dark: "#111827", // gray-900
    edge: "#374151", // gray-700
  },
  // Shadow color for active states
  shadow: "rgba(245, 158, 11, 0.6)", // amber with opacity
};

export const NfaVisualizer: React.FC<NfaVisualizerProps> = ({
  nfa,
  containerRef,
  networkRef,
  onResetLayout,
  className = "",
  externalFullscreen = false,
  onToggleFullscreen,
}) => {
  console.log("NfaVisualizer rendered, externalFullscreen:", externalFullscreen);

  // Enhanced state management
  const [visualizationHeight, setVisualizationHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // State and refs for vis-network data and instance - Moved from app/page.tsx
  const [nfaAllStates, setNfaAllStates] = useState<State[]>([]); // Moved from app/page.tsx
  const nodesDataSet = useRef<DataSet<VisNode> | null>(null); // Moved from app/page.tsx
  const edgesDataSet = useRef<DataSet<VisEdge> | null>(null); // Moved from app/page.tsx
  const originalNodeColors = useRef<OriginalNodeColors>(new Map()); // Moved from app/page.tsx

  // Determine effective fullscreen state
  const isFullscreen = externalFullscreen;

  // Effect to derive all_states from NFA - Moved from app/page.tsx
  useEffect(() => {
    if (nfa) {
      const statesMap = new Map<number, State>();
      statesMap.set(nfa.start.id, nfa.start);
      statesMap.set(nfa.end.id, nfa.end);
      nfa.transitions.forEach((t) => {
        if (!statesMap.has(t.from.id)) statesMap.set(t.from.id, t.from);
        if (!statesMap.has(t.to.id)) statesMap.set(t.to.id, t.to);
      });

      const uniqueStatesFromNFA = Array.from(statesMap.values()).sort(
        (a, b) => a.id - b.id
      );
      setNfaAllStates(uniqueStatesFromNFA);
    } else {
      setNfaAllStates([]);
    }
  }, [nfa]); // Dependency: nfa prop

  // Keep activeTransitions state and related effect/logic in NfaVisualizer
  const [activeTransitions] = useState<Set<string>>(new Set()); // Moved from app/page.tsx

  // Effect for vis-network initialization and updates - Moved from app/page.tsx
  useEffect(() => {
    if (!containerRef.current) return;

    if (nfa && nfaAllStates.length > 0) {
      // Use the networkRef passed as a prop
      if (networkRef?.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
      originalNodeColors.current.clear();

      const visNodesData = nfaAllStates.map((s): VisNode => {
        const isStart = s.id === nfa.start.id;
        const isAccept = s.isAccept;

        let colorScheme = COLORS.regular;
        if (isStart) colorScheme = COLORS.start;
        else if (isAccept) colorScheme = COLORS.accept;

        const nodeColorObj: VisNode["color"] = {
          background: colorScheme.background,
          border: colorScheme.border,
          highlight: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
          hover: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
        };

        originalNodeColors.current.set(s.id, nodeColorObj);

        return {
          id: s.id,
          label: isStart ? `S:${s.id}` : isAccept ? `A:${s.id}` : `${s.id}`,
          title: `State ${s.id}${isStart ? " (Start)" : ""}${
            isAccept ? " (Accept)" : ""
          }`,
          color: nodeColorObj,
          shape: "circle",
          size: 20,
          font: {
            color: COLORS.text.light,
            size: 12,
            face: "Arial, sans-serif",
          },
          borderWidth: isStart || isAccept ? 3 : 2,
          shadow: false,
        };
      });
      nodesDataSet.current = new DataSet<VisNode>(visNodesData);

      const visEdgesData = nfa.transitions.map((t, index): VisEdge => {
        const isEpsilon = t.symbol === undefined;
        let edgeColor = COLORS.edges.default;

        if (t.symbol === "a") edgeColor = COLORS.edges.a;
        else if (t.symbol === "b") edgeColor = COLORS.edges.b;
        else if (t.symbol === "c") edgeColor = COLORS.edges.c;
        else if (isEpsilon) edgeColor = COLORS.edges.epsilon;

        // Check if there's a bidirectional connection
        const hasReverseConnection = nfa.transitions.some(
          (otherT) => otherT.from.id === t.to.id && otherT.to.id === t.from.id
        );

        return {
          id: index,
          from: t.from.id,
          to: t.to.id,
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
          color: {
            color: edgeColor,
            highlight: COLORS.edges.highlight,
            hover: COLORS.edges.hover,
          },
          label: isEpsilon ? "ε" : t.symbol,
          font: {
            color: COLORS.text.edge,
            size: 12,
            face: "Arial, sans-serif",
          },
          smooth: {
            enabled: hasReverseConnection,
            type: "curvedCW",
            roundness: 0.2,
          },
        };
      });
      edgesDataSet.current = new DataSet<VisEdge>(visEdgesData);

      const options: Options = {
        nodes: {
          shape: "circle",
          size: 20,
          font: {
            color: COLORS.text.light,
            size: 12,
            face: "Arial, sans-serif",
          },
          borderWidth: 2,
          shadow: false,
        },
        edges: {
          arrows: {
            to: { enabled: true, scaleFactor: 1 },
          },
          font: {
            color: COLORS.text.edge,
            size: 12,
            face: "Arial, sans-serif",
          },
          smooth: {
            enabled: true,
            type: "curvedCW",
            roundness: 0.2,
          },
        },
        physics: {
          enabled: true,
          solver: "forceAtlas2Based",
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 200,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 0.5,
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 25,
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true,
          dragView: true,
        },
      };

      const network = new Network(
        containerRef.current,
        {
          nodes: nodesDataSet.current,
          edges: edgesDataSet.current,
        },
        options
      );

      if (networkRef) {
        networkRef.current = network;
      }

      network.on("click", (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodesDataSet.current?.get(nodeId);
          if (node) {
            console.log("Clicked node:", node);
          }
        }
      });

      return () => {
        network.destroy();
      };
    }
  }, [nfa, nfaAllStates, containerRef, networkRef, activeTransitions]); // Added activeTransitions to dependencies

  // Effect for highlighting states based on currentStep and history - Keep in NfaVisualizer
  // This useEffect is now simplified to just update state colors based on the NFA structure.
  // Simulation-specific highlighting is handled by passing activeTransitions from the parent.
  useEffect(() => {
      if (!nodesDataSet.current || !nfa || nfaAllStates.length === 0) return;

      const updates: NodeUpdateData[] = [];
      nfaAllStates.forEach((s) => {
        const isStart = s.id === nfa.start.id;
        const isAccept = s.isAccept;

        let colorScheme = COLORS.regular;
        if (isStart) colorScheme = COLORS.start;
        else if (isAccept) colorScheme = COLORS.accept;

        const nodeColorObj: VisNode["color"] = {
          background: colorScheme.background,
          border: colorScheme.border,
          highlight: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
          hover: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
        };

        updates.push({
          id: s.id,
          color: nodeColorObj,
          shadow: false, // No simulation-specific shadow here
        });
      });
       if (updates.length > 0) {
        nodesDataSet.current?.update(updates);
      }
  }, [nfa, nfaAllStates]);


  // Effect to update edge highlighting based on activeTransitions - Keep in NfaVisualizer
  useEffect(() => {
    if (edgesDataSet.current) {
      const updates = edgesDataSet.current.getIds().map((edgeId) => ({
        id: String(edgeId),
        color: {
          color: activeTransitions.has(String(edgeId)) ? COLORS.active.background : COLORS.edges.default,
          highlight: COLORS.edges.highlight,
          hover: COLORS.edges.hover,
        },
        width: activeTransitions.has(String(edgeId)) ? 5 : 3,
        shadow: activeTransitions.has(String(edgeId)) ? {
          enabled: true,
          color: 'rgba(245, 158, 11, 0.8)',
          size: 15,
          x: 0,
          y: 0
        } : false
      }));
      edgesDataSet.current.update(updates);
    }
  }, [activeTransitions]); // Depend on activeTransitions (which will need to be set by parent during simulation)


  // Handle resize functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isFullscreen) return;

      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startY = e.clientY;
      const startHeight = visualizationHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
        setVisualizationHeight(newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [visualizationHeight, isFullscreen] // Depend on the effective isFullscreen
  );

  // containerHeight logic should use the effective isFullscreen state
  const containerHeight = isFullscreen
    ? "calc(100vh - 0rem)" // Use 0rem for true fullscreen on the new page
    : `${visualizationHeight}px`;

  // Compute NFA statistics
  const nfaStats = useMemo(() => {
    if (!nfa) return null;

    const allStates = new Set([
      nfa.start.id,
      nfa.end.id,
      ...nfa.transitions.flatMap((t) => [t.from.id, t.to.id]),
    ]);

    const symbols = new Set(
      nfa.transitions
        .map((t) => t.symbol)
        .filter((s) => s !== null && s !== "ε")
    );

    const epsilonTransitions = nfa.transitions.filter(
      (t) => t.symbol === null || t.symbol === "ε"
    ).length;

    return {
      stateCount: allStates.size,
      transitionCount: nfa.transitions.length,
      symbolCount: symbols.size,
      epsilonTransitions,
      isDeterministic:
        epsilonTransitions === 0 &&
        nfa.transitions.every(
          (t1, i) =>
            !nfa.transitions
              .slice(i + 1)
              .some(
                (t2) => t1.from.id === t2.from.id && t1.symbol === t2.symbol
              )
        ),
    };
  }, [nfa]);

  return (
    <Box
      className={`
        bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden
        transition-all duration-300 ease-in-out
        ${isFullscreen ? "fixed inset-0 z-50 shadow-2xl rounded-none" : ""}
        ${className}
      `}
    >
      {/* Header with regex pattern */}


      {/* Toolbar */}
      <VisualizationToolbar
        hasNfa={!!nfa}
        onResetLayout={onResetLayout}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleStats={() => setShowStats(!showStats)}
        showStats={showStats}
        networkRef={networkRef}
      />

      {/* Main visualization area */}
      <Box className="relative">
        <VisualizationCanvas
          nfa={nfa}
          containerRef={containerRef}
          height={containerHeight}
          isResizing={isResizing}
        />

        {/* Resize handle - only show when not fullscreen */}
        {nfa && !isFullscreen && (
          <div
            className={`
              absolute bottom-0 left-0 right-0 h-3 cursor-row-resize
              hover:bg-blue-50 transition-colors flex items-center justify-center
              group border-t border-transparent hover:border-blue-200
              ${isResizing ? "bg-blue-100 border-blue-300" : ""}
            `}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-1 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors" />
            </div>
          </div>
        )}
      </Box>

      {/* Stats footer */}
      {nfa && nfaStats && showStats && <VisualizationStats stats={nfaStats} />}
    </Box>
  );
};

export default NfaVisualizer;
