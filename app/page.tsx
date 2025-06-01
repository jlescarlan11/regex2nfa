// app/page.tsx
"use client"; // This page is highly interactive
import ErrorAlert from "@/app/_components/ErrorAlert";
import InputPanel from "@/app/_input_panel/InputPanel";
import SimulationCard from "@/app/_simulation_card/SimulationCard";
import {
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Text,
} from "@radix-ui/themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Options } from "vis-network/standalone"; // Edge, IdType, Node are now in types/vis.ts
import { DataSet, Network } from "vis-network/standalone";

import type { State, Transition } from "@/app/_types/nfa";
import type {
  NodeUpdateData,
  OriginalNodeColors,
  VisEdge,
  VisNode,
} from "@/app/_types/vis";
import {
  buildNFAFromPostfix,
  computeEpsilonClosure,
  processCharacterStep,
} from "@/app/_utils/nfa";
import { parseRegexToPostfix } from "@/app/_utils/regex";
import NfaVisualizer from "./_nfa_visualizer/NfaVisualizer";
import { initDriver } from "./driver";

// Define color scheme using actual hex/rgb values
const COLORS = {
  // Start state colors (blue)
  start: {
    background: "#3b82f6", // blue-500
    border: "#2563eb", // blue-600
    highlight: "#1d4ed8", // blue-700
    hover: "#1e40af", // blue-800
  },
  // Accept state colors (green)
  accept: {
    background: "#10b981", // emerald-500
    border: "#059669", // emerald-600
    highlight: "#047857", // emerald-700
    hover: "#065f46", // emerald-800
  },
  // Regular state colors (gray)
  regular: {
    background: "#6b7280", // gray-500
    border: "#4b5563", // gray-600
    highlight: "#374151", // gray-700
    hover: "#1f2937", // gray-800
  },
  // Active state colors (yellow/amber)
  active: {
    background: "#f59e0b", // amber-500
    border: "#d97706", // amber-600
    highlight: "#b45309", // amber-700
    hover: "#92400e", // amber-800
  },
  // Edge colors
  edges: {
    default: "#9ca3af", // gray-400
    epsilon: "#8b5cf6", // violet-500
    a: "#ef4444", // red-500
    b: "#3b82f6", // blue-500
    c: "#06b6d4", // cyan-500
    highlight: "#f59e0b", // amber-500
    hover: "#fbbf24", // amber-400
  },
  // Text colors
  text: {
    light: "#f9fafb", // gray-50
    dark: "#111827", // gray-900
    edge: "#374151", // gray-700
  },
  // Shadow color for active states
  shadow: "rgba(245, 158, 11, 0.6)", // amber with opacity
};

const HomePage: React.FC = () => {
  const [localRegexInput, setLocalRegexInput] = useState<string>("a(b|c)*d"); // Default example
  const [testString, setTestString] = useState<string>("abd"); // Default example
  const [nfa, setNFA] = useState<{
    start: State;
    end: State;
    transitions: Transition[];
  } | null>(null);
  const [nfaAllStates, setNfaAllStates] = useState<State[]>([]);
  const [history, setHistory] = useState<Set<State>[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(800); // Default speed
  const [showGuide, setShowGuide] = useState(true);

  const networkRef = useRef<Network | null>(null);
  const nodesDataSet = useRef<DataSet<VisNode> | null>(null); // Use VisNode
  const edgesDataSet = useRef<DataSet<VisEdge> | null>(null); // Use VisEdge
  const originalNodeColors = useRef<OriginalNodeColors>(new Map());
  const containerRef = useRef<HTMLDivElement>(null!); // Changed to non-null assertion

  // Initial NFA generation for default regex
  useEffect(() => {
    if (localRegexInput && !nfa) {
      // Only if no NFA yet (e.g. on initial load with default)
      handleConvert(true); // Pass a flag to indicate initial load if needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Effect to derive all_states from NFA and initialize history
  useEffect(() => {
    if (nfa) {
      const statesMap = new Map<number, State>();
      // Add start and end states first
      statesMap.set(nfa.start.id, nfa.start);
      statesMap.set(nfa.end.id, nfa.end);
      // Add states from transitions
      nfa.transitions.forEach((t) => {
        if (!statesMap.has(t.from.id)) statesMap.set(t.from.id, t.from);
        if (!statesMap.has(t.to.id)) statesMap.set(t.to.id, t.to);
      });

      const uniqueStatesFromNFA = Array.from(statesMap.values()).sort(
        (a, b) => a.id - b.id
      );
      setNfaAllStates(uniqueStatesFromNFA);

      // Reset simulation for new NFA
      handleResetSimulation(new Set([nfa.start]));
    } else {
      setNfaAllStates([]);
      setHistory([]);
      setCurrentStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfa]); // Dependency: nfa

  const highlightStates = useCallback(
    (statesToHighlight: Set<State> | undefined) => {
      if (!nodesDataSet.current || nfaAllStates.length === 0) {
        // If no NFA or states, try to reset any existing highlights if nodesDataSet exists
        if (nodesDataSet.current && nodesDataSet.current.length > 0) {
          const resetUpdates: NodeUpdateData[] = nodesDataSet.current
            .getIds()
            .map((nodeId) => ({
              id: nodeId,
              color: originalNodeColors.current.get(nodeId) || {
                background: COLORS.regular.background,
                border: COLORS.regular.border,
              },
              shadow: false,
            }));
          if (resetUpdates.length > 0)
            nodesDataSet.current.update(resetUpdates);
        }
        return;
      }

      if (!statesToHighlight) {
        // If no states to highlight (e.g. simulation reset before NFA)
        return;
      }

      const updates: NodeUpdateData[] = [];
      nfaAllStates.forEach((s) => {
        const isActive = statesToHighlight.has(s);
        const originalColor = originalNodeColors.current.get(s.id);

        let newColor: VisNode["color"] = originalColor || {
          background: COLORS.regular.background,
          border: COLORS.regular.border,
        };

        if (isActive) {
          newColor = {
            background: COLORS.active.background,
            border: COLORS.active.border,
            highlight: {
              background: COLORS.active.highlight,
              border: COLORS.active.hover,
            },
            hover: {
              background: COLORS.active.highlight,
              border: COLORS.active.hover,
            },
          };
        }

        updates.push({
          id: s.id,
          color: newColor,
          shadow: isActive
            ? {
                enabled: true,
                color: COLORS.shadow,
                size: 15,
                x: 0,
                y: 0,
              }
            : false,
        });
      });

      if (updates.length > 0) {
        nodesDataSet.current?.update(updates);
      }
    },
    [nfaAllStates] // Removed nodesDataSet from deps as it's a ref
  );

  // Effect for vis-network initialization and updates
  useEffect(() => {
    if (!containerRef.current) return;

    if (nfa && nfaAllStates.length > 0) {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
      originalNodeColors.current.clear();

      const visNodesData = nfaAllStates.map((s): VisNode => {
        const isStart = s.id === nfa.start.id;
        const isAccept = s.isAccept;

        let colorScheme = COLORS.regular;
        if (isStart) colorScheme = COLORS.start;
        else if (isAccept) colorScheme = COLORS.accept;

        const nodeColorObj: VisNode["color"] = {
          background: colorScheme.background,
          border: colorScheme.border,
          highlight: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
          hover: {
            background: colorScheme.highlight,
            border: colorScheme.hover,
          },
        };

        originalNodeColors.current.set(s.id, nodeColorObj);

        return {
          id: s.id,
          label: isStart ? `S:${s.id}` : isAccept ? `A:${s.id}` : `${s.id}`,
          title: `State ${s.id}${isStart ? " (Start)" : ""}${
            isAccept ? " (Accept)" : ""
          }`,
          color: nodeColorObj,
          shape: "circle",
          size: 20,
          font: {
            color: COLORS.text.light,
            size: 12,
            face: "Arial, sans-serif",
          },
          borderWidth: isStart || isAccept ? 3 : 2,
          shadow: false,
        };
      });
      nodesDataSet.current = new DataSet<VisNode>(visNodesData);

      const visEdgesData = nfa.transitions.map((t, index): VisEdge => {
        const isEpsilon = t.symbol === undefined;
        let edgeColor = COLORS.edges.default;

        if (t.symbol === "a") edgeColor = COLORS.edges.a;
        else if (t.symbol === "b") edgeColor = COLORS.edges.b;
        else if (t.symbol === "c") edgeColor = COLORS.edges.c;
        else if (isEpsilon) edgeColor = COLORS.edges.epsilon;

        return {
          id: `e${index}`,
          from: t.from.id,
          to: t.to.id,
          label: isEpsilon ? "ε" : t.symbol,
          arrows: "to",
          dashes: isEpsilon,
          color: {
            color: edgeColor,
            highlight: COLORS.edges.highlight,
            hover: COLORS.edges.hover,
          },
          font: {
            size: 12,
            align: "middle",
            color: COLORS.text.edge,
            strokeWidth: 2,
            strokeColor: "#ffffff",
          },
          smooth: {
            enabled: true,
            type:
              isEpsilon && t.from.id !== t.to.id ? "curvedCW" : "continuous",
            roundness: 0.15,
          },
          width: 2,
          hoverWidth: 0.5,
          selectionWidth: 0.5,
          title: `Transition: ${
            isEpsilon ? "ε (epsilon)" : t.symbol || "ε"
          } from ${t.from.id} to ${t.to.id}`,
        };
      });
      edgesDataSet.current = new DataSet<VisEdge>(visEdgesData);

      const options: Options = {
        nodes: {
          shape: "circle",
          size: 20,
          font: {
            color: COLORS.text.light,
            size: 12,
            face: "Arial, sans-serif",
          },
          borderWidth: 2,
        },
        edges: {
          arrows: { to: { enabled: true, scaleFactor: 0.8 } },
          smooth: { enabled: true, type: "dynamic", roundness: 0.15 },
          font: {
            size: 12,
            color: COLORS.text.edge,
            strokeWidth: 2,
            strokeColor: "#ffffff",
          },
          width: 2,
          color: {
            color: COLORS.edges.default,
            highlight: COLORS.edges.highlight,
            hover: COLORS.edges.hover,
          },
        },
        physics: {
          enabled: true,
          solver: "barnesHut",
          barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.15,
            springLength: 120,
            springConstant: 0.05,
            damping: 0.1,
            avoidOverlap: 0.6,
          },
          stabilization: { iterations: 500, fit: true },
        },
        layout: { hierarchical: false },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
          hover: true,
          tooltipDelay: 200,
        },
        manipulation: false,
      };

      networkRef.current = new Network(
        containerRef.current,
        { nodes: nodesDataSet.current, edges: edgesDataSet.current },
        options
      );

      networkRef.current.on("stabilizationIterationsDone", () => {
        networkRef.current?.fit({
          animation: { duration: 500, easingFunction: "easeInOutQuad" },
        });
      });
    } else if (!nfa && networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
      nodesDataSet.current?.clear();
      edgesDataSet.current?.clear();
      originalNodeColors.current.clear();
    }
  }, [nfa, nfaAllStates]);

  const handleConvert = (isInitialLoad = false) => {
    setError(null);
    // Clear previous NFA state before building new one
    setNFA(null);
    setIsPlaying(false);

    if (!localRegexInput.trim() && localRegexInput !== "") {
      // Allow empty string for epsilon NFA
      setError("Regular expression cannot be only whitespace.");
      return;
    }
    if (localRegexInput.length > 100 && !isInitialLoad) {
      // Length check
      setError(
        "Regex is too long (max 100 chars). For longer patterns, performance may degrade."
      );
    }

    try {
      const postfix = parseRegexToPostfix(localRegexInput);
      const newNfa = buildNFAFromPostfix(postfix);
      setNFA(newNfa);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid regular expression or NFA construction failed."
      );
      setNFA(null);
    }
  };

  const handleResetSimulation = useCallback(
    (initialStatesOverride?: Set<State>) => {
      setIsPlaying(false);
      setCurrentStep(0);
      if (nfa) {
        const initialActiveStates =
          initialStatesOverride ||
          computeEpsilonClosure(new Set([nfa.start]), nfa.transitions);
        setHistory([initialActiveStates]);
        highlightStates(initialActiveStates);
      } else {
        setHistory([]);
        highlightStates(new Set());
      }
    },
    [nfa, highlightStates]
  );

  const handleStepForward = useCallback(() => {
    if (!nfa || currentStep >= testString.length || !history[currentStep])
      return;

    const currentActiveStates = history[currentStep];
    const nextCharacter = testString[currentStep];
    const nextActiveStates = processCharacterStep(
      currentActiveStates,
      nextCharacter,
      nfa.transitions
    );

    const newHistory = [...history];
    if (newHistory.length <= currentStep + 1) {
      for (let i = newHistory.length; i <= currentStep + 1; i++) {
        newHistory.push(new Set<State>());
      }
    }
    newHistory[currentStep + 1] = nextActiveStates;

    setHistory(newHistory);
    setCurrentStep(currentStep + 1);
  }, [nfa, currentStep, testString, history]);

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      setIsPlaying(false);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleResetLayout = () => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: { duration: 500, easingFunction: "easeInOutQuad" },
      });
    }
  };

  // Effect for highlighting states based on currentStep and history
  useEffect(() => {
    if (nfa && history.length > 0 && history[currentStep] !== undefined) {
      highlightStates(history[currentStep]);
    } else if (!nfa) {
      highlightStates(new Set());
    }
  }, [currentStep, history, nfa, highlightStates]);

  // Effect for autoplay
  useEffect(() => {
    let timeoutId: number;
    if (isPlaying && nfa && currentStep < testString.length) {
      timeoutId = window.setTimeout(handleStepForward, animationSpeed);
    } else if (isPlaying && (currentStep >= testString.length || !nfa)) {
      setIsPlaying(false);
    }
    return () => window.clearTimeout(timeoutId);
  }, [
    isPlaying,
    nfa,
    currentStep,
    testString,
    handleStepForward,
    animationSpeed,
  ]);

  // Effect to reset simulation when testString or NFA changes
  useEffect(() => {
    handleResetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testString, nfa]);

  // Keyboard shortcuts for simulation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      let preventDefault = true;
      switch (e.key.toLowerCase()) {
        case " ":
          if (
            nfa &&
            testString &&
            (currentStep < testString.length || !isPlaying)
          ) {
            setIsPlaying((prev) => !prev);
          } else preventDefault = false;
          break;
        case "arrowright":
          if (!isPlaying) handleStepForward();
          else preventDefault = false;
          break;
        case "arrowleft":
          if (!isPlaying) handleStepBackward();
          else preventDefault = false;
          break;
        case "r":
          if (nfa) handleResetSimulation();
          else preventDefault = false;
          break;
        default:
          preventDefault = false;
      }
      if (preventDefault) e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    isPlaying,
    nfa,
    testString,
    currentStep,
    handleStepForward,
    handleStepBackward,
    handleResetSimulation,
  ]);

  const handleRegexInputKeyDown = () => {
    // This function can be extended if specific key handling for regex input is needed
  };

  const isAccepted =
    currentStep === testString.length &&
    history.length > currentStep &&
    history[currentStep] !== undefined
      ? Array.from(history[currentStep]).some((s) => s.isAccept)
      : false;

  useEffect(() => {
    if (showGuide) {
      const driverObj = initDriver();
      driverObj.drive();
      setShowGuide(false);
    }
  }, [showGuide]);

  return (
    <Container className="max-w-7xl mx-auto px-4">
      {/* Workflow Progress Indicator */}
      <Box className="py-8">
        <Flex direction="row" gap="4" align="center" justify="center">
          <Flex align="center" gap="2">
            <Badge
              size="2"
              color="blue"
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              1
            </Badge>
            <Text size="2" weight="medium" className="text-blue-900">
              Input Regex
            </Text>
          </Flex>

          <div className="w-8 h-px bg-gray-300" />

          <Flex
            align="center"
            gap="2"
            className={nfa ? "opacity-100" : "opacity-50"}
          >
            <Badge
              size="2"
              color={nfa ? "green" : "gray"}
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              2
            </Badge>
            <Text
              size="2"
              weight="medium"
              className={nfa ? "text-green-900" : "text-gray-400"}
            >
              Visualize NFA
            </Text>
          </Flex>

          <div className="w-8 h-px bg-gray-300" />

          <Flex
            align="center"
            gap="2"
            className={nfa ? "opacity-100" : "opacity-50"}
          >
            <Badge
              size="2"
              color={nfa ? "orange" : "gray"}
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              3
            </Badge>
            <Text
              size="2"
              weight="medium"
              className={nfa ? "text-amber-900" : "text-gray-400"}
            >
              Test & Simulate
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Three-Column Workflow Layout */}
      <Grid
        columns={{ initial: "1", md: "1fr 2fr 1fr" }}
        gap="4"
        className="max-w-7xl mx-auto"
      >
        {/* STEP 1: Input Section */}
        <Flex direction="column" gap="4">
          <Card
            id="regex-input-container"
            className="p-4 border-2 border-blue-500 bg-blue-50"
          >
            <Flex align="center" gap="2" className="mb-4">
              <Badge
                size="1"
                color="blue"
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                1
              </Badge>
              <Text size="3" weight="bold" className="text-blue-900">
                Regular Expression Input
              </Text>
            </Flex>

            <ErrorAlert error={error} />
            <InputPanel
              localRegexInput={localRegexInput}
              setLocalRegexInput={setLocalRegexInput}
              onVisualize={() => handleConvert()}
              error={error}
              handleRegexInputKeyDown={handleRegexInputKeyDown}
            />
          </Card>
        </Flex>

        {/* STEP 2: Visualization Section */}
        <Flex direction="column" gap="4">
          <Card
            id="nfa-visualization"
            className={`p-4 border-2 min-h-96 ${
              nfa
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Flex align="center" gap="2" className="mb-4">
              <Badge
                size="1"
                color={nfa ? "green" : "gray"}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                2
              </Badge>
              <Text
                size="3"
                weight="bold"
                className={nfa ? "text-green-900" : "text-gray-500"}
              >
                NFA Visualization
              </Text>
            </Flex>

            <NfaVisualizer
              nfa={nfa}
              containerRef={containerRef}
              networkRef={networkRef}
              onResetLayout={handleResetLayout}
              regex={""}
              className="w-full"
            />
          </Card>
        </Flex>

        {/* STEP 3: Simulation Section */}
        <Flex direction="column" gap="4">
          <Card
            id="simulation-container"
            className={`p-4 border-2 ${
              nfa
                ? "border-amber-500 bg-amber-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Flex align="center" gap="2" className="mb-4">
              <Badge
                size="1"
                color={nfa ? "orange" : "gray"}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                3
              </Badge>
              <Text
                size="3"
                weight="bold"
                className={nfa ? "text-amber-900" : "text-gray-500"}
              >
                String Simulation
              </Text>
            </Flex>

            <SimulationCard
              testString={testString}
              setTestString={setTestString}
              nfa={nfa}
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              handleStepBackward={handleStepBackward}
              currentStep={currentStep}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              handleStepForward={handleStepForward}
              isAccepted={isAccepted}
              history={history}
              handleResetSimulation={handleResetSimulation}
            />
          </Card>
        </Flex>
      </Grid>
    </Container>
  );
};

export default HomePage;
