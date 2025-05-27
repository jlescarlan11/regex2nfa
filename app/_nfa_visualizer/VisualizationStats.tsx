// components/VisualizationStats.tsx
"use client";

import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import React from "react";

interface NfaStats {
  stateCount: number;
  transitionCount: number;
  symbolCount: number;
  epsilonTransitions: number;
  isDeterministic: boolean;
}

interface VisualizationStatsProps {
  stats: NfaStats;
}

export const VisualizationStats: React.FC<VisualizationStatsProps> = ({
  stats,
}) => {
  const StatItem: React.FC<{
    label: string;
    value: string | number;
    color?: string;
    icon?: React.ReactNode;
  }> = ({ label, value, color = "gray", icon }) => (
    <Flex
      align="center"
      gap="2"
      className="px-3 py-2 bg-white rounded-lg border border-gray-100"
    >
      {icon && <span className="text-gray-400">{icon}</span>}
      <Flex direction="column" gap="1">
        <Text
          size="1"
          color="gray"
          className="font-medium uppercase tracking-wide"
        >
          {label}
        </Text>
        <Text size="2" weight="bold" className={`text-${color}-700`}>
          {value}
        </Text>
      </Flex>
    </Flex>
  );

  return (
    <Box className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
      <Flex align="center" justify="between" wrap="wrap" gap="3">
        <Flex align="center" gap="4" wrap="wrap">
          <StatItem
            label="States"
            value={stats.stateCount}
            color="blue"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            }
          />

          <StatItem
            label="Transitions"
            value={stats.transitionCount}
            color="green"
            icon={
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            }
          />

          <StatItem
            label="Symbols"
            value={stats.symbolCount}
            color="purple"
            icon={
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
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            }
          />

          {stats.epsilonTransitions > 0 && (
            <StatItem
              label="ε-Transitions"
              value={stats.epsilonTransitions}
              color="amber"
              icon={<span className="text-sm font-bold">ε</span>}
            />
          )}
        </Flex>

        <Flex align="center" gap="3">
          <Badge
            color={stats.isDeterministic ? "green" : "orange"}
            variant="soft"
            className="px-3 py-1"
          >
            <Flex align="center" gap="1">
              <span
                className={`w-2 h-2 rounded-full ${
                  stats.isDeterministic ? "bg-green-500" : "bg-orange-500"
                }`}
              />
              {stats.isDeterministic ? "DFA" : "NFA"}
            </Flex>
          </Badge>

          <div className="text-xs text-gray-500 hidden sm:block">
            {stats.isDeterministic
              ? "Deterministic - each state has exactly one transition per symbol"
              : "Non-deterministic - contains ε-transitions or multiple transitions per symbol"}
          </div>
        </Flex>
      </Flex>
    </Box>
  );
};
