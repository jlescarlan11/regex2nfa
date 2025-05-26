// components/NfaDetailsCard.tsx
"use client";
import type { State, Transition } from "@/app/_types/nfa";
import {
  BarChartIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  GearIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Callout,
  Card,
  Flex,
  Heading,
  Inset,
  Separator,
  Tabs,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import React from "react";

interface NfaDetailsCardProps {
  nfa: { start: State; end: State; transitions: Transition[] } | null;
  nfaAllStates: State[];
}

const StatItem: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "amber" | "gray";
}> = ({ label, value, icon, color = "blue" }) => (
  <Flex
    direction="column"
    gap="2"
    p="3"
    style={{
      backgroundColor: "var(--gray-a2)",
      borderRadius: "var(--radius-3)",
      border: "1px solid var(--gray-a5)",
      flex: 1,
      minWidth: "120px",
    }}
  >
    <Flex align="center" gap="2">
      {icon && <Text color={color}>{icon}</Text>}
      <Text size="2" color="gray" weight="medium">
        {label}
      </Text>
    </Flex>
    <Text size="5" weight="bold" style={{ color: `var(--${color}-11)` }}>
      {value}
    </Text>
  </Flex>
);

const PerformanceIndicator: React.FC<{ stateCount: number }> = ({
  stateCount,
}) => {
  let performance: "excellent" | "good" | "fair" | "poor" = "excellent";
  let color: "green" | "blue" | "amber" | "red" = "green";
  let message = "";

  if (stateCount <= 10) {
    performance = "excellent";
    color = "green";
    message = "Optimal performance";
  } else if (stateCount <= 30) {
    performance = "good";
    color = "blue";
    message = "Good performance";
  } else if (stateCount <= 50) {
    performance = "fair";
    color = "amber";
    message = "May affect performance";
  } else {
    performance = "poor";
    color = "red";
    message = "Performance impact expected";
  }

  return (
    <Flex
      align="center"
      justify="between"
      p="3"
      style={{
        backgroundColor: "var(--gray-a2)",
        borderRadius: "var(--radius-2)",
        border: "1px solid var(--gray-a5)",
      }}
    >
      <Flex align="center" gap="2">
        <GearIcon color={`var(--${color}-11)`} />
        <Text size="2" weight="medium">
          Performance
        </Text>
      </Flex>
      <Flex align="center" gap="2">
        <Badge color={color} variant="soft" highContrast>
          {performance.toUpperCase()}
        </Badge>
        <Tooltip content={message}>
          <InfoCircledIcon color="var(--gray-9)" />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

const PerformanceWarning: React.FC<{ stateCount: number }> = ({
  stateCount,
}) => {
  if (stateCount <= 50) return null;

  const severity = stateCount > 100 ? "high" : "medium";
  const message =
    stateCount > 100
      ? `Very large NFA (${stateCount} states) may significantly impact browser performance and rendering speed.`
      : `Large NFA (${stateCount} states) may affect visualization performance.`;

  return (
    <Callout.Root
      color={severity === "high" ? "red" : "amber"}
      size="2"
      highContrast
    >
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
};

const AcceptStatesDisplay: React.FC<{ acceptStates: State[] }> = ({
  acceptStates,
}) => {
  if (acceptStates.length === 0) {
    return (
      <Badge color="gray" variant="soft" highContrast>
        None
      </Badge>
    );
  }

  const MAX_DISPLAY = 8;
  return (
    <Flex wrap="wrap" gap="2">
      {acceptStates.slice(0, MAX_DISPLAY).map((state) => (
        <Badge
          key={state.id}
          color="green"
          variant="solid"
          highContrast
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {state.id}
        </Badge>
      ))}
      {acceptStates.length > MAX_DISPLAY && (
        <Tooltip
          content={
            <Box p="2">
              <Text size="1" weight="medium" mb="1">
                Additional Accept States:
              </Text>
              <Text size="1" style={{ fontFamily: "var(--font-mono)" }}>
                {acceptStates
                  .slice(MAX_DISPLAY)
                  .map((s) => s.id)
                  .join(", ")}
              </Text>
            </Box>
          }
        >
          <Badge color="gray" variant="outline">
            +{acceptStates.length - MAX_DISPLAY} more
          </Badge>
        </Tooltip>
      )}
    </Flex>
  );
};

const AlphabetDisplay: React.FC<{ alphabet: Set<string> }> = ({ alphabet }) => {
  if (alphabet.size === 0) {
    return (
      <Badge color="amber" variant="soft" highContrast>
        ε-transitions only
      </Badge>
    );
  }

  const MAX_DISPLAY = 12;
  const alphabetArray = Array.from(alphabet).sort();

  return (
    <Flex wrap="wrap" gap="1">
      {alphabetArray.slice(0, MAX_DISPLAY).map((symbol) => (
        <Badge
          key={symbol}
          variant="outline"
          color="blue"
          style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
        >
          {symbol}
        </Badge>
      ))}
      {alphabet.size > MAX_DISPLAY && (
        <Tooltip
          content={
            <Box p="2" style={{ maxWidth: "200px" }}>
              <Text size="1" weight="medium" mb="1">
                Additional Symbols:
              </Text>
              <Text size="1" style={{ fontFamily: "var(--font-mono)" }}>
                {alphabetArray.slice(MAX_DISPLAY).join(", ")}
              </Text>
            </Box>
          }
        >
          <Badge variant="outline" color="gray">
            +{alphabet.size - MAX_DISPLAY} more
          </Badge>
        </Tooltip>
      )}
    </Flex>
  );
};

const OverviewTab: React.FC<{
  nfa: { start: State; end: State; transitions: Transition[] };
  nfaAllStates: State[];
  acceptStates: State[];
  alphabet: Set<string>;
}> = ({ nfa, nfaAllStates, acceptStates, alphabet }) => {
  const stateCount = nfaAllStates.length;
  const transitionCount = nfa.transitions.length;

  return (
    <Flex direction="column" gap="4">
      {/* Key Metrics */}
      <Flex gap="3" direction={{ initial: "column", xs: "row" }}>
        <StatItem
          label="States"
          value={stateCount}
          icon={<BarChartIcon />}
          color="blue"
        />
        <StatItem
          label="Transitions"
          value={transitionCount}
          icon={<InfoCircledIcon />}
          color="green"
        />
        <StatItem
          label="Accept States"
          value={acceptStates.length}
          icon={<CheckCircledIcon />}
          color="amber"
        />
      </Flex>

      {/* Performance Indicator */}
      <PerformanceIndicator stateCount={stateCount} />

      {/* Performance Warning */}
      <PerformanceWarning stateCount={stateCount} />
    </Flex>
  );
};

const StatesTab: React.FC<{
  nfa: { start: State; end: State; transitions: Transition[] };
  acceptStates: State[];
}> = ({ nfa, acceptStates }) => {
  return (
    <Flex direction="column" gap="4">
      <Box>
        <Flex align="center" gap="2" mb="3">
          <Text size="3" weight="bold">
            Start State
          </Text>
        </Flex>
        <Badge
          color="blue"
          variant="solid"
          highContrast
          size="2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {nfa.start.id}
        </Badge>
      </Box>

      <Separator size="4" />

      <Box>
        <Flex align="center" gap="2" mb="3">
          <Text size="3" weight="bold">
            Accept States
          </Text>
          <Badge color="green" variant="soft">
            {acceptStates.length}
          </Badge>
        </Flex>
        <AcceptStatesDisplay acceptStates={acceptStates} />
      </Box>
    </Flex>
  );
};

const AlphabetTab: React.FC<{ alphabet: Set<string> }> = ({ alphabet }) => {
  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="2" mb="2">
        <Text size="3" weight="bold">
          Input Alphabet
        </Text>
        <Badge color="blue" variant="soft">
          {alphabet.size} symbols
        </Badge>
      </Flex>

      <AlphabetDisplay alphabet={alphabet} />

      {alphabet.size > 0 && (
        <Box
          p="3"
          style={{
            backgroundColor: "var(--gray-a2)",
            borderRadius: "var(--radius-2)",
            border: "1px solid var(--gray-a5)",
          }}
        >
          <Text size="1" color="gray">
            These are the input symbols that the NFA can process. ε-transitions
            (empty transitions) are handled separately.
          </Text>
        </Box>
      )}
    </Flex>
  );
};

const NfaDetailsCard: React.FC<NfaDetailsCardProps> = ({
  nfa,
  nfaAllStates,
}) => {
  if (!nfa) {
    return (
      <Card size="3">
        <Inset clip="padding-box" side="top" pb="current">
          <Flex
            align="center"
            justify="center"
            py="4"
            px="4"
            style={{
              backgroundColor: "var(--gray-a2)",
              borderBottom: "1px solid var(--gray-a5)",
            }}
          >
            <Heading as="h2" size="4" weight="medium">
              NFA Analysis
            </Heading>
          </Flex>
        </Inset>
        <Flex direction="column" align="center" justify="center" p="8" gap="3">
          <BarChartIcon width="32" height="32" color="var(--gray-8)" />
          <Text size="3" weight="medium" color="gray">
            No NFA Generated
          </Text>
          <Text
            size="2"
            color="gray"
            align="center"
            style={{ maxWidth: "280px" }}
          >
            Enter a regular expression to visualize the corresponding NFA and
            analyze its properties.
          </Text>
        </Flex>
      </Card>
    );
  }

  const acceptStates = nfaAllStates.filter((s) => s.isAccept);
  const alphabet = new Set(
    nfa.transitions.map((t) => t.symbol).filter((s) => s !== undefined)
  );

  return (
    <Card size="3">
      <Inset clip="padding-box" side="top" pb="current">
        <Flex
          align="center"
          justify="between"
          py="3"
          px="4"
          style={{
            backgroundColor: "var(--gray-a2)",
            borderBottom: "1px solid var(--gray-a5)",
          }}
        >
          <Heading as="h2" size="4" weight="medium">
            NFA Analysis
          </Heading>
          <Badge color="blue" variant="soft" highContrast>
            Non-deterministic FA
          </Badge>
        </Flex>
      </Inset>

      <Box p="4">
        <Tabs.Root defaultValue="overview">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="states">States</Tabs.Trigger>
            <Tabs.Trigger value="alphabet">Alphabet</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="overview">
              <OverviewTab
                nfa={nfa}
                nfaAllStates={nfaAllStates}
                acceptStates={acceptStates}
                alphabet={alphabet}
              />
            </Tabs.Content>

            <Tabs.Content value="states">
              <StatesTab nfa={nfa} acceptStates={acceptStates} />
            </Tabs.Content>

            <Tabs.Content value="alphabet">
              <AlphabetTab alphabet={alphabet} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </Card>
  );
};

export default NfaDetailsCard;
