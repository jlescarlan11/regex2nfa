// components/NfaVisualizationCard.tsx

"use client";

import type { State, Transition } from "@/app/_types/nfa";

import {
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import * as RadixTooltip from "@radix-ui/react-tooltip";

import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Inset,
  Text,
  Separator,
} from "@radix-ui/themes";

import React, { useMemo } from "react";

import { Network } from "vis-network";

interface NfaVisualizationCardProps {
  nfa: { start: State; end: State; transitions: Transition[] } | null;

  containerRef: React.RefObject<HTMLDivElement>;

  handleResetLayout: () => void;

  networkRef?: React.RefObject<Network | null>;
}

// Enhanced color scheme with better contrast and accessibility

const COLOR_SCHEME = {
  start: {
    background: "#3b82f6", // Blue-500

    border: "#1d4ed8", // Blue-700

    highlight: "#60a5fa", // Blue-400

    text: "#ffffff",
  },

  accept: {
    background: "#10b981", // Emerald-500

    border: "#047857", // Emerald-700

    highlight: "#34d399", // Emerald-400

    text: "#ffffff",
  },

  intermediate: {
    background: "#6b7280", // Gray-500

    border: "#374151", // Gray-700

    highlight: "#9ca3af", // Gray-400

    text: "#ffffff",
  },

  edge: {
    color: "#4b5563", // Gray-600

    highlight: "#1f2937", // Gray-800

    hover: "#6b7280", // Gray-500
  },
};

const VisualizationControls = ({
  onResetLayout,

  networkRef,

  hasNfa,
}: {
  onResetLayout: () => void;

  networkRef?: React.RefObject<Network | null>;

  hasNfa: boolean;
}) => {
  const handleZoom = (direction: "in" | "out") => {
    if (!networkRef?.current) return;

    const scale = networkRef.current.getScale();

    const newScale = direction === "in" ? scale * 1.2 : scale * 0.8;

    networkRef.current.moveTo({ scale: newScale });
  };

  const handleFitToScreen = () => {
    if (!networkRef?.current) return;

    networkRef.current.fit({
      animation: {
        duration: 500,

        easingFunction: "easeInOutQuad",
      },
    });
  };

  return (
    <Flex
      gap="1"
      align="center"
      className="bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-gray-200"
    >
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
            Zoom Out
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

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
            Zoom In
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

      <Separator orientation="vertical" size="1" className="mx-1" />

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
            Fit to Screen
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>

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
            Reset Layout
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </Flex>
  );
};

const EmptyStateIllustration = () => (
  <div className="relative">
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-gray-300"
    >
      {/* Start state */}

      <circle
        cx="20"
        cy="40"
        r="12"
        fill="blue-500"
        fillOpacity="0.1"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      <text
        x="20"
        y="45"
        textAnchor="middle"
        className="text-xs fill-blue-500 font-medium"
      >
        S
      </text>

      {/* Arrow */}

      <path
        d="M35 40 L65 40 M60 35 L65 40 L60 45"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        strokeDasharray="3 3"
      />

      {/* Accept state */}

      <circle
        cx="100"
        cy="40"
        r="12"
        fill="#10b981"
        fillOpacity="0.1"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      <circle
        cx="100"
        cy="40"
        r="8"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />

      <text
        x="100"
        y="45"
        textAnchor="middle"
        className="text-xs fill-emerald-500 font-medium"
      >
        F
      </text>
    </svg>

    {/* Animated pulse effect */}

    <div className="absolute inset-0 animate-pulse opacity-30">
      <div className="w-6 h-6 bg-blue-400 rounded-full absolute left-[14px] top-[34px]" />

      <div className="w-6 h-6 bg-emerald-400 rounded-full absolute right-[14px] top-[34px]" />
    </div>
  </div>
);

const EmptyVisualizationState = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    gap="4"
    p="8"
    className="h-full text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200"
  >
    <EmptyStateIllustration />

    <div className="space-y-2">
      <Heading size="5" className="text-gray-700 font-semibold">
        Ready to Visualize
      </Heading>

      <Text as="p" size="3" color="gray" className="max-w-sm leading-relaxed">
        Enter a regular expression and click{" "}
        <Badge variant="soft" color="blue" highContrast className="font-medium">
          Visualize
        </Badge>{" "}
        to generate and explore the NFA graph.
      </Text>
    </div>

    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <Text as="p" size="2" color="gray" className="font-medium mb-1">
        Supported operators:
      </Text>

      <div className="flex flex-wrap gap-1">
        {["*", "+", "?", "|", "()", "\\e"].map((op) => (
          <code
            key={op}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
          >
            {op}
          </code>
        ))}
      </div>
    </div>
  </Flex>
);

const VisualizationContainer = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => (
  <Box
    ref={containerRef}
    className="flex-1 relative  border border-gray-500 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-inner  h-[400px] min-h-fit"
    aria-label="NFA Graph Visualization"
  >
    <VisuallyHidden.Root>
      Interactive visualization of the Non-deterministic Finite Automaton. Blue
      circles represent start states, green circles with double borders
      represent accept states, and gray circles represent intermediate states.
      Use mouse to pan and zoom, click and drag nodes to rearrange.
    </VisuallyHidden.Root>

    {/* Grid background pattern for better spatial awareness */}

    <div
      className="absolute inset-0  opacity-20 pointer-events-none"
      style={{
        backgroundImage: `

          radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)

        `,

        backgroundSize: "20px 20px",
      }}
    />
  </Box>
);

const NfaStats = ({
  stateCount,

  transitionCount,
}: {
  stateCount: number;

  transitionCount: number;
}) => (
  <Flex gap="4" align="center" className="text-sm">
    <Flex gap="2" align="center" className="bg-blue-50 px-2 py-1 rounded-md">
      <Box className="w-2 h-2 rounded-full bg-blue-500" />

      <Text size="2" className="font-medium text-blue-700">
        {stateCount} state{stateCount !== 1 ? "s" : ""}
      </Text>
    </Flex>

    <Flex gap="2" align="center" className="bg-gray-50 px-2 py-1 rounded-md">
      <Box className="w-3 h-0.5 bg-gray-500 rounded-full" />

      <Text size="2" className="font-medium text-gray-700">
        {transitionCount} transition{transitionCount !== 1 ? "s" : ""}
      </Text>
    </Flex>
  </Flex>
);

const EnhancedStateLegend = () => (
  <Flex gap="4" align="center" className="text-xs">
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <Flex
          gap="2"
          align="center"
          className="cursor-help hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        >
          <div className="relative">
            <Box className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600" />
          </div>

          <Text size="1" className="font-medium text-blue-700">
            Start
          </Text>
        </Flex>
      </RadixTooltip.Trigger>

      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg max-w-48"
          sideOffset={8}
        >
          Initial state where the automaton begins processing input
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>

    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <Flex
          gap="2"
          align="center"
          className="cursor-help hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
        >
          <div className="relative">
            <Box className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-600" />

            <Box className="absolute inset-0.5 rounded-full border border-emerald-300" />
          </div>

          <Text size="1" className="font-medium text-emerald-700">
            Accept
          </Text>
        </Flex>
      </RadixTooltip.Trigger>

      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg max-w-48"
          sideOffset={8}
        >
          Final state indicating successful pattern matching
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>

    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <Flex
          gap="2"
          align="center"
          className="cursor-help hover:bg-gray-50 px-2 py-1 rounded transition-colors"
        >
          <Box className="w-3 h-3 rounded-full bg-gray-500 border-2 border-gray-600" />

          <Text size="1" className="font-medium text-gray-700">
            State
          </Text>
        </Flex>
      </RadixTooltip.Trigger>

      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium shadow-lg max-w-48"
          sideOffset={8}
        >
          Intermediate state in the automaton
          <RadixTooltip.Arrow className="fill-gray-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </Flex>
);

// Helper function to generate vis.js network options with enhanced styling

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

// Helper function to style nodes based on their type

export const getNodeStyle = (
  state: State,

  isStart: boolean,

  isAccept: boolean
) => {
  if (isStart) {
    return {
      color: {
        background: COLOR_SCHEME.start.background,

        border: COLOR_SCHEME.start.border,

        highlight: {
          background: COLOR_SCHEME.start.highlight,

          border: COLOR_SCHEME.start.border,
        },
      },
    };
  } else if (isAccept) {
    return {
      color: {
        background: COLOR_SCHEME.accept.background,

        border: COLOR_SCHEME.accept.border,

        highlight: {
          background: COLOR_SCHEME.accept.highlight,

          border: COLOR_SCHEME.accept.border,
        },
      },

      shapeProperties: {
        borderDashes: false,
      },

      borderWidth: 5, // Thicker border for accept states
    };
  } else {
    return {
      color: {
        background: COLOR_SCHEME.intermediate.background,

        border: COLOR_SCHEME.intermediate.border,

        highlight: {
          background: COLOR_SCHEME.intermediate.highlight,

          border: COLOR_SCHEME.intermediate.border,
        },
      },
    };
  }
};

export const NfaVisualizationCardComponent: React.FC<
  NfaVisualizationCardProps
> = ({ nfa, containerRef, handleResetLayout, networkRef }) => {
  const { stateCount, transitionCount } = useMemo(() => {
    if (!nfa) return { stateCount: 0, transitionCount: 0 };

    const states = new Set([
      nfa.start.id,

      nfa.end.id,

      ...nfa.transitions.flatMap((t) => [t.from.id, t.to.id]),
    ]);

    return {
      stateCount: states.size,

      transitionCount: nfa.transitions.length,
    };
  }, [nfa]);

  return (
    <RadixTooltip.Provider delayDuration={300}>
      <Card size="3" className="flex flex-col shadow-lg border-gray-200">
        <Inset clip="padding-box" side="top" pb="current">
          {" "}
          <Flex
            justify="between"
            align="center"
            py="4"
            px="6"
            className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white"
          >
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <Heading size="5" weight="bold" className="text-gray-800">
                  NFA Visualization
                </Heading>

                <RadixTooltip.Root>
                  <RadixTooltip.Trigger asChild>
                    <IconButton size="1" variant="ghost" color="gray">
                      <InfoCircledIcon width="14" height="14" />
                    </IconButton>
                  </RadixTooltip.Trigger>

                  <RadixTooltip.Portal>
                    <RadixTooltip.Content
                      className="bg-gray-900 text-white px-3 py-2 rounded text-sm font-medium shadow-lg max-w-64"
                      sideOffset={8}
                    >
                      Interactive graph showing the Non-deterministic Finite
                      Automaton structure
                      <RadixTooltip.Arrow className="fill-gray-900" />
                    </RadixTooltip.Content>
                  </RadixTooltip.Portal>
                </RadixTooltip.Root>
              </Flex>

              {nfa && (
                <NfaStats
                  stateCount={stateCount}
                  transitionCount={transitionCount}
                />
              )}
            </Flex>

            {nfa && (
              <VisualizationControls
                onResetLayout={handleResetLayout}
                networkRef={networkRef}
                hasNfa={!!nfa}
              />
            )}
          </Flex>
        </Inset>

        <Box className="flex-1 relative p-6">
          {nfa ? (
            <VisualizationContainer containerRef={containerRef} />
          ) : (
            <EmptyVisualizationState />
          )}
        </Box>

        {nfa && (
          <Inset clip="padding-box" side="bottom" pt="current">
            <Flex
              justify="between"
              align="center"
              px="6"
              py="3"
              className="border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"
            >
              <Text size="2" color="gray" className="font-medium">
                💡 Drag nodes • Scroll to zoom • Click for details
              </Text>

              <EnhancedStateLegend />
            </Flex>
          </Inset>
        )}
      </Card>
    </RadixTooltip.Provider>
  );
};

export default NfaVisualizationCardComponent;
