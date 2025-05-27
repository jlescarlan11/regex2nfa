// components/NfaVisualizer.tsx
"use client";

import type { State, Transition } from "@/app/_types/nfa";
import { Box, Flex } from "@radix-ui/themes";
import React, { useCallback, useMemo, useState } from "react";
import { Network } from "vis-network";

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
  regex?: string; // The original regex pattern
}

export const NfaVisualizer: React.FC<NfaVisualizerProps> = ({
  nfa,
  containerRef,
  networkRef,
  onResetLayout,
  className = "",
  regex,
}) => {
  // Enhanced state management
  const [visualizationHeight, setVisualizationHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(true);

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
    [visualizationHeight, isFullscreen]
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const containerHeight = isFullscreen
    ? "calc(100vh - 8rem)"
    : `${visualizationHeight}px`;

  return (
    <Box
      className={`
        bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden
        transition-all duration-300 ease-in-out
        ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""}
        ${className}
      `}
    >
      {/* Header with regex pattern */}
      {regex && (
        <Box className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <Flex align="center" gap="2" className="text-sm">
            <span className="text-gray-600 font-medium">Pattern:</span>
            <code className="px-2 py-1 bg-white rounded border text-blue-700 font-mono">
              {regex}
            </code>
          </Flex>
        </Box>
      )}

      {/* Toolbar */}
      <VisualizationToolbar
        hasNfa={!!nfa}
        onResetLayout={onResetLayout}
        onToggleFullscreen={toggleFullscreen}
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
