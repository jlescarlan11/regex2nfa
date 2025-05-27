// components/VisualizationCanvas.tsx
"use client";

import type { State, Transition } from "@/app/_types/nfa";
import { Box } from "@radix-ui/themes";
import React from "react";

interface VisualizationCanvasProps {
  nfa: { start: State; end: State; transitions: Transition[] } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  height: string;
  isResizing: boolean;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  nfa,
  containerRef,
  height,
  isResizing,
}) => {
  if (!nfa) {
    return <EmptyVisualizationState height={height} />;
  }

  return (
    <Box
      className={`
        relative overflow-hidden bg-white
        transition-all duration-200 ease-out
        ${isResizing ? "select-none" : ""}
      `}
      style={{ height }}
    >
      {/* Network visualization container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          background: `
            radial-gradient(circle at 20px 20px, #e2e8f0 1px, transparent 1px),
            radial-gradient(circle at 40px 40px, #e2e8f0 0.5px, transparent 0.5px)
          `,
          backgroundSize: "40px 40px, 20px 20px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      {/* Loading overlay during resize */}
      {isResizing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            Resizing...
          </div>
        </div>
      )}

      {/* Interactive hints overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-600">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Drag to move nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Scroll to zoom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Right-click for options</span>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

// Empty state component
const EmptyVisualizationState: React.FC<{ height: string }> = ({ height }) => {
  return (
    <Box
      className="flex flex-col items-center justify-center text-gray-500 bg-gray-50"
      style={{ height }}
    >
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-6">
          <svg
            className="w-20 h-20 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Ready to visualize
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed">
          Enter a regular expression to generate and visualize its corresponding
          Non-deterministic Finite Automaton (NFA). The visualization will show
          states, transitions, and the flow of the automaton.
        </p>

        <div className="mt-6 text-xs text-gray-400">
          <p>
            💡 Try patterns like:{" "}
            <code className="px-1 py-0.5 bg-gray-200 rounded">a*b+</code>,{" "}
            <code className="px-1 py-0.5 bg-gray-200 rounded">(a|b)*</code>,{" "}
            <code className="px-1 py-0.5 bg-gray-200 rounded">a+b?c</code>
          </p>
        </div>
      </div>
    </Box>
  );
};
