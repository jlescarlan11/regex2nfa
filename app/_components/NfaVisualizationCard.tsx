// components/NfaVisualizationCard.tsx

"use client";

import type { State, Transition } from "@/app/_types/nfa";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Box, Flex, Inset, Text } from "@radix-ui/themes";
import React, { useCallback, useState } from "react";
import { Network } from "vis-network";

// Import sub-components
import EmptyVisualizationState from "./EmptyVisualizationState";
import { VisualizationContainer } from "./VisualizationContainer";
import { VisualizationControls } from "./VisualizationControls";
// import { EnhancedStateLegend } from "./EnhancedStateLegend";

interface NfaVisualizationCardProps {
  nfa: { start: State; end: State; transitions: Transition[] } | null;
  containerRef: React.RefObject<HTMLDivElement>;
  handleResetLayout: () => void;
  networkRef?: React.RefObject<Network | null>;
  className?: string;
}

export const NfaVisualizationCardComponent: React.FC<
  NfaVisualizationCardProps
> = ({ nfa, containerRef, handleResetLayout, networkRef, className = "" }) => {
  // State for resizable functionality
  const [isResizing, setIsResizing] = useState(false);
  const [visualizationHeight, setVisualizationHeight] = useState(600); // Increased default height

  // Handle resizing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startY = e.clientY;
      const startHeight = visualizationHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = e.clientY - startY;
        const newHeight = Math.max(400, Math.min(1200, startHeight + deltaY));
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
    [visualizationHeight]
  );

  return (
    <Box className={` ${className}`}>
      {nfa && (
        <VisualizationControls
          onResetLayout={handleResetLayout}
          networkRef={networkRef}
          hasNfa={!!nfa}
        />
      )}

      {/* Main Visualization Area - Now Much Larger */}
      <Box
        className="flex-1 relative p-2"
        style={{
          minHeight: nfa ? `${visualizationHeight}px` : "400px",
          maxHeight: nfa ? `${visualizationHeight}px` : "400px",
        }}
      >
        {nfa ? (
          <>
            <VisualizationContainer
              containerRef={containerRef}
              height={visualizationHeight - 16} // Account for padding
            />
            {/* Resize Handle */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-100 transition-colors flex items-center justify-center group ${
                isResizing ? "bg-blue-200" : ""
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DragHandleDots2Icon className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
            </div>
          </>
        ) : (
          <EmptyVisualizationState />
        )}
      </Box>

      {/* Compact Footer */}
      {nfa && (
        <Inset clip="padding-box" side="bottom" pt="current">
          <Flex
            justify="between"
            align="center"
            px="4"
            py="2"
            className="border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"
          >
            <Text size="1" color="gray" className="font-medium">
              💡 Drag nodes • Right-click for context • Resize by dragging
              bottom edge
            </Text>
            {/* <EnhancedStateLegend compact /> */}
          </Flex>
        </Inset>
      )}
    </Box>
  );
};

export default NfaVisualizationCardComponent;
