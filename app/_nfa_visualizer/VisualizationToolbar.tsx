// components/VisualizationToolbar.tsx
"use client";

import {
  DownloadIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  InfoCircledIcon,
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { Button, Flex, Separator, Tooltip } from "@radix-ui/themes";
import React from "react";
import { Network } from "vis-network";

interface VisualizationToolbarProps {
  hasNfa: boolean;
  onResetLayout: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onToggleStats: () => void;
  showStats: boolean;
  networkRef?: React.RefObject<Network | null>;
}

export const VisualizationToolbar: React.FC<VisualizationToolbarProps> = ({
  hasNfa,
  onResetLayout,
  onToggleFullscreen,
  isFullscreen,
  onToggleStats,
  showStats,
  networkRef,
}) => {
  console.log("VisualizationToolbar rendered, onToggleFullscreen prop:", onToggleFullscreen);

  const handleZoomIn = () => {
    if (networkRef?.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({
        scale: Math.min(scale * 1.2, 3),
        animation: {
          duration: 500,
          /*************  ✨ Windsurf Command ⭐  *************/
          /**
           * Zoom out the visualization by a factor of 0.8, or as far out as possible
           * if the current scale is already very small.
           */
          /*******  a5c9a75d-3e2b-426d-b9f4-71c9df6c8eca  *******/ easingFunction:
            "easeInOutQuart",
        },
      });
    }
  };

  const handleZoomOut = () => {
    if (networkRef?.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({
        scale: Math.max(scale * 0.8, 0.1),
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuart",
        },
      });
    }
  };

  const handleFitToScreen = () => {
    if (networkRef?.current) {
      networkRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: "easeInOutQuart",
        },
      });
    }
  };

  const handleExportImage = () => {
    if (networkRef?.current) {
      try {
        // Get the canvas element
        const canvas = document.querySelector("canvas");

        if (canvas instanceof HTMLCanvasElement) {
          const dataURL = canvas.toDataURL("image/png");

          const link = document.createElement("a");
          link.download = "nfa-visualization.png";
          link.href = dataURL;
          link.click();
        }
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  };

  if (!hasNfa) return null;

  return (
    <Flex
      align="center"
      justify="between"
      px="4"
      py="2"
      className="bg-gray-50 border-b border-gray-200"
    >
      <Flex align="center" gap="2">
        {/* Layout Controls */}
        <Tooltip content="Reset layout and center view">
          <Button
            variant="ghost"
            size="2"
            onClick={onResetLayout}
            className="text-gray-600 hover:text-gray-900"
          >
            <ResetIcon className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Fit to screen">
          <Button
            variant="ghost"
            size="2"
            onClick={handleFitToScreen}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </Button>
        </Tooltip>

        <Separator orientation="vertical" size="1" />

        {/* Zoom Controls */}
        <Tooltip content="Zoom in">
          <Button
            variant="ghost"
            size="2"
            onClick={handleZoomIn}
            className="text-gray-600 hover:text-gray-900"
          >
            <ZoomInIcon className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Zoom out">
          <Button
            variant="ghost"
            size="2"
            onClick={handleZoomOut}
            className="text-gray-600 hover:text-gray-900"
          >
            <ZoomOutIcon className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Separator orientation="vertical" size="1" />

        {/* Export */}
        <Tooltip content="Export as PNG">
          <Button
            variant="ghost"
            size="2"
            onClick={handleExportImage}
            className="text-gray-600 hover:text-gray-900"
          >
            <DownloadIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      </Flex>

      <Flex align="center" gap="2">
        {/* View Options */}
        <Tooltip content={showStats ? "Hide statistics" : "Show statistics"}>
          <Button
            variant="ghost"
            size="2"
            onClick={onToggleStats}
            className={`${
              showStats ? "text-blue-600" : "text-gray-600"
            } hover:text-gray-900`}
          >
            <InfoCircledIcon className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Separator orientation="vertical" size="1" />

        {/* Fullscreen Toggle */}
        <Tooltip
          content={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <Button
            variant="ghost"
            size="2"
            onClick={() => {
              console.log("VisualizationToolbar fullscreen button clicked");
              onToggleFullscreen();
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            {isFullscreen ? (
              <ExitFullScreenIcon className="w-4 h-4" />
            ) : (
              <EnterFullScreenIcon className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
      </Flex>
    </Flex>
  );
};
