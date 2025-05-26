// components/VisualizationContainer.tsx

import React from "react";
import { Box } from "@radix-ui/themes";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface VisualizationContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  height?: number;
}

export const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  containerRef,
  height = 600,
}) => {
  return (
    <Box
      ref={containerRef}
      className="w-full relative border-2 border-gray-300 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-inner overflow-hidden"
      style={{
        height: `${height}px`,
        minHeight: `${height}px`,
        maxHeight: `${height}px`,
      }}
      aria-label="NFA Graph Visualization"
    >
      <VisuallyHidden.Root>
        Interactive visualization of the Non-deterministic Finite Automaton.
        Blue circles represent start states, green circles with double borders
        represent accept states, and gray circles represent intermediate states.
        Use mouse to pan and zoom, click and drag nodes to rearrange.
      </VisuallyHidden.Root>

      {/* Enhanced grid background pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
            radial-gradient(circle at 20px 20px, rgba(59,130,246,0.1) 2px, transparent 2px)
          `,
          backgroundSize: "20px 20px, 20px 20px, 40px 40px",
        }}
      />

      {/* Corner indicators for better spatial awareness */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-gray-300 opacity-30" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-gray-300 opacity-30" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-gray-300 opacity-30" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-gray-300 opacity-30" />

      {/* Loading overlay for complex NFAs */}
      <div
        id="loading-overlay"
        className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600 font-medium">
            Rendering NFA...
          </span>
        </div>
      </div>
    </Box>
  );
};
