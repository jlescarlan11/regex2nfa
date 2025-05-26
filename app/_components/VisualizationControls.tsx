// components/VisualizationControls.tsx

import React from "react";
import {
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MoveIcon,
  LockClosedIcon,
  LockOpen1Icon,
} from "@radix-ui/react-icons";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { Flex, IconButton, Separator, Box, Text } from "@radix-ui/themes";
import { Network } from "vis-network";

interface VisualizationControlsProps {
  onResetLayout: () => void;
  networkRef?: React.RefObject<Network | null>;
  hasNfa: boolean;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  onResetLayout,
  networkRef,
  hasNfa,
}) => {
  const [isPhysicsEnabled, setIsPhysicsEnabled] = React.useState(true);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const handleZoom = (direction: "in" | "out") => {
    if (!networkRef?.current) return;
    const scale = networkRef.current.getScale();
    const newScale = direction === "in" ? scale * 1.3 : scale * 0.77;
    networkRef.current.moveTo({
      scale: newScale,
      animation: {
        duration: 200,
        easingFunction: "easeInOutQuad",
      },
    });
    setZoomLevel(newScale);
  };

  const handleFitToScreen = () => {
    if (!networkRef?.current) return;
    networkRef.current.fit({
      animation: {
        duration: 500,
        easingFunction: "easeInOutQuad",
      },
    });
    setZoomLevel(1);
  };

  const togglePhysics = () => {
    if (!networkRef?.current) return;
    const newPhysicsState = !isPhysicsEnabled;
    networkRef.current.setOptions({
      physics: {
        enabled: newPhysicsState,
      },
    });
    setIsPhysicsEnabled(newPhysicsState);
  };

  const handleCenter = () => {
    if (!networkRef?.current) return;
    networkRef.current.moveTo({
      position: { x: 0, y: 0 },
      animation: {
        duration: 300,
        easingFunction: "easeInOutQuad",
      },
    });
  };

  return (
    <Flex
      gap="1"
      align="center"
      className="bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200 shadow-lg"
    >
      {/* Zoom Out */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={() => handleZoom("out")}
            disabled={!hasNfa}
            aria-label="Zoom out"
          >
            <ZoomOutIcon width="16" height="16" />
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            Zoom Out (Ctrl + -)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      {/* Zoom Level Indicator */}
      <Box className="px-2 py-1 bg-gray-50 rounded text-xs font-mono min-w-[3rem] text-center">
        <Text size="1" color="gray">
          {Math.round(zoomLevel * 100)}%
        </Text>
      </Box>

      {/* Zoom In */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={() => handleZoom("in")}
            disabled={!hasNfa}
            aria-label="Zoom in"
          >
            <ZoomInIcon width="16" height="16" />
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            Zoom In (Ctrl + =)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      <Separator orientation="vertical" size="1" className="mx-1" />

      {/* Fit to Screen */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={handleFitToScreen}
            disabled={!hasNfa}
            aria-label="Fit to screen"
          >
            <Box className="w-4 h-4 border border-current rounded-sm flex items-center justify-center">
              <Box className="w-1.5 h-1.5 bg-current rounded-full" />
            </Box>
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            Fit to Screen (F)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      {/* Center View */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={handleCenter}
            disabled={!hasNfa}
            aria-label="Center view"
          >
            <MoveIcon width="16" height="16" />
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            Center View (C)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      <Separator orientation="vertical" size="1" className="mx-1" />

      {/* Toggle Physics */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant={isPhysicsEnabled ? "soft" : "ghost"}
            color={isPhysicsEnabled ? "blue" : "gray"}
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={togglePhysics}
            disabled={!hasNfa}
            aria-label={isPhysicsEnabled ? "Disable physics" : "Enable physics"}
          >
            {isPhysicsEnabled ? (
              <LockOpen1Icon width="16" height="16" />
            ) : (
              <LockClosedIcon width="16" height="16" />
            )}
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            {isPhysicsEnabled ? "Lock Nodes" : "Unlock Nodes"} (P)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      {/* Reset Layout */}
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <IconButton
            size="2"
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 transition-colors duration-200"
            onClick={onResetLayout}
            disabled={!hasNfa}
            aria-label="Reset layout"
          >
            <ResetIcon width="16" height="16" />
          </IconButton>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg"
            sideOffset={8}
          >
            Reset Layout (R)
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </Flex>
  );
};
