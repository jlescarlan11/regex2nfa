// components/NfaStats.tsx
import { Box, Flex, Text } from "@radix-ui/themes";
import React from "react";

interface NfaStatsProps {
  stateCount: number;
  transitionCount: number;
}

export const NfaStats: React.FC<NfaStatsProps> = ({
  stateCount,
  transitionCount,
}) => (
  <Flex gap="3" align="center" className="text-sm">
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

// components/EnhancedStateLegend.tsx
import * as RadixTooltip from "@radix-ui/react-tooltip";

interface EnhancedStateLegendProps {
  compact?: boolean;
}

export const EnhancedStateLegend: React.FC<EnhancedStateLegendProps> = ({
  compact = false,
}) => (
  <Flex gap={compact ? "2" : "4"} align="center" className="text-xs">
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

// components/EmptyVisualizationState.tsx
import { Badge, Heading } from "@radix-ui/themes";

const EmptyStateIllustration = () => (
  <div className="relative">
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-gray-300"
    >
      {/* Start state */}
      <circle
        cx="30"
        cy="60"
        r="18"
        fill="blue-500"
        fillOpacity="0.1"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeDasharray="6 6"
      />
      <text
        x="30"
        y="67"
        textAnchor="middle"
        className="text-sm fill-blue-500 font-bold"
      >
        S
      </text>

      {/* Arrow */}
      <path
        d="M52 60 L108 60 M100 52 L108 60 L100 68"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
        strokeDasharray="4 4"
      />

      {/* Accept state */}
      <circle
        cx="130"
        cy="60"
        r="18"
        fill="#10b981"
        fillOpacity="0.1"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="6 6"
      />
      <circle
        cx="130"
        cy="60"
        r="12"
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <text
        x="130"
        y="67"
        textAnchor="middle"
        className="text-sm fill-emerald-500 font-bold"
      >
        F
      </text>
    </svg>

    {/* Animated pulse effect */}
    <div className="absolute inset-0 animate-pulse opacity-40">
      <div className="w-8 h-8 bg-blue-400 rounded-full absolute left-[22px] top-[52px]" />
      <div className="w-8 h-8 bg-emerald-400 rounded-full absolute right-[22px] top-[52px]" />
    </div>
  </div>
);

export const EmptyVisualizationState = () => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    gap="6"
    p="8"
    className="h-full text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200"
  >
    <EmptyStateIllustration />

    <div className="space-y-3">
      <Heading size="6" className="text-gray-700 font-bold">
        Ready to Visualize Your NFA
      </Heading>
      <Text as="p" size="4" color="gray" className="max-w-md leading-relaxed">
        Enter a regular expression above and click{" "}
        <Badge
          variant="soft"
          color="blue"
          highContrast
          className="font-medium px-2 py-1"
        >
          Generate NFA
        </Badge>{" "}
        to create an interactive visualization of the automaton.
      </Text>
    </div>

    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg">
      <Text as="p" size="3" color="gray" className="font-semibold mb-3">
        Supported regex operators:
      </Text>
      <div className="grid grid-cols-3 gap-2">
        {[
          { op: "*", desc: "Zero or more" },
          { op: "+", desc: "One or more" },
          { op: "?", desc: "Optional" },
          { op: "|", desc: "Alternation" },
          { op: "()", desc: "Grouping" },
          { op: "\\e", desc: "Epsilon" },
        ].map(({ op, desc }) => (
          <div
            key={op}
            className="flex flex-col items-center p-2 bg-gray-50 rounded-lg"
          >
            <code className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono font-bold">
              {op}
            </code>
            <span className="text-xs text-gray-600 mt-1 text-center">
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Text size="2" className="text-blue-700 font-medium">
        💡 Tip: Start with simple patterns like{" "}
        <code className="bg-blue-100 px-1 rounded">a*b</code> or{" "}
        <code className="bg-blue-100 px-1 rounded">(a|b)*</code>
      </Text>
    </div>
  </Flex>
);
