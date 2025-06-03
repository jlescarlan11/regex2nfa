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
import React, { useCallback, useEffect, useRef, useState, Suspense } from "react";
import type { Options } from "vis-network/standalone"; // Edge, IdType, Node are now in types/vis.ts
import { DataSet, Network } from "vis-network/standalone";

import { useRouter, useSearchParams } from 'next/navigation';

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

const HomePageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  // Initialize localRegexInput from URL parameter if available, otherwise use default
  const urlRegex = searchParams.get('regex');
  const initialRegex = urlRegex ? atob(urlRegex) : "a(b|c)*d"; // Decode base64
  const [localRegexInput, setLocalRegexInput] = useState<string>(initialRegex);

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
  const [activeTransitions, setActiveTransitions] = useState<Set<string>>(new Set());

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

      // Ensure statesToHighlight is a Set
      const statesSet = statesToHighlight instanceof Set ? statesToHighlight : new Set<State>();

      const updates: NodeUpdateData[] = [];
      nfaAllStates.forEach((s) => {
        const isActive = statesSet.has(s);
        const originalColor = originalNodeColors.current.get(s.id);
        const isAcceptingState = s.isAccept;
        const isStringComplete = currentStep === testString.length;

        let newColor: VisNode["color"] = originalColor || {
          background: COLORS.regular.background,
          border: COLORS.regular.border,
        };

        if (isActive) {
          // If it's an accepting state and we're at the end of the string
          if (isAcceptingState && isStringComplete) {
            newColor = {
              background: COLORS.accept.background,
              border: COLORS.accept.border,
              highlight: {
                background: COLORS.accept.highlight,
                border: COLORS.accept.hover,
              },
              hover: {
                background: COLORS.accept.highlight,
                border: COLORS.accept.hover,
              },
            };
          } else {
            // Regular active state highlighting
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
        }

        updates.push({
          id: s.id,
          color: newColor,
          shadow: isActive && isAcceptingState && isStringComplete
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
    [nfaAllStates, currentStep, testString.length] // Added dependencies for string completion check
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
          label: isStart ? `S:${s.id}` : isAccept ? `F:${s.id}` : `${s.id}`,
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

        const hasReverseConnection = nfa.transitions.some(
          (otherT) => otherT.from.id === t.to.id && otherT.to.id === t.from.id
        );

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
            enabled: hasReverseConnection,
            type: hasReverseConnection ? "curvedCW" : "continuous",
            roundness: hasReverseConnection ? 0.2 : 0
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
          smooth: { enabled: false, type: "continuous", roundness: 0 },
          font: {
            size: 12,
            color: COLORS.text.edge,
            strokeWidth: 2,
            strokeColor: "#ffffff",
          },
          width: 3,
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.2)',
            size: 10,
            x: 0,
            y: 0
          },
          color: {
            color: COLORS.edges.default,
            highlight: COLORS.edges.highlight,
            hover: COLORS.edges.hover,
            opacity: 0.9
          },
        },
        physics: {
          enabled: true,
          solver: "barnesHut",
          barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.15,
            springLength: 80,
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
      setActiveTransitions(new Set());
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
    
    // Find active transitions for the current step
    const activeTransitionsSet = new Set<string>();
    const nextActiveStates = processCharacterStep(
      currentActiveStates,
      nextCharacter,
      nfa.transitions
    );

    // Only highlight transitions that lead to the next active states
    nfa.transitions.forEach((t, index) => {
      if (currentActiveStates.has(t.from) && 
          nextActiveStates.has(t.to) &&
          (t.symbol === nextCharacter || t.symbol === undefined)) {
        activeTransitionsSet.add(`e${index}`);
      }
    });

    // Update transitions with a slight delay to make it more visible
    setTimeout(() => {
      setActiveTransitions(activeTransitionsSet);
    }, 100);

    const newHistory = [...history];
    if (newHistory.length <= currentStep + 1) {
      for (let i = newHistory.length; i <= currentStep + 1; i++) {
        newHistory.push(new Set<State>());
      }
    }
    newHistory[currentStep + 1] = nextActiveStates;

    setHistory(newHistory);
    setCurrentStep(currentStep + 1);

    // Clear transitions after a delay
    setTimeout(() => {
      setActiveTransitions(new Set());
    }, animationSpeed - 100);
  }, [nfa, currentStep, testString, history, animationSpeed]);

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

      // Highlight final epsilon transitions if simulation is complete and accepted
      if (currentStep === testString.length) {
        const finalActiveStates = history[currentStep];
        const epsilonTransitions = new Set<string>();

        // Find epsilon transitions leading into the final active states
        nfa.transitions.forEach((t, index) => {
          if ((t.symbol === undefined || t.symbol === null || t.symbol === 'ε') &&
              history[currentStep - 1]?.has(t.from) &&
              finalActiveStates.has(t.to)) {
            epsilonTransitions.add(`e${index}`);
          }
        });
        setActiveTransitions(epsilonTransitions);
      } else {
         // Clear transitions if not at the final step
         setActiveTransitions(new Set());
      }

    } else if (!nfa) {
      highlightStates(new Set());
      setActiveTransitions(new Set()); // Also clear transitions if NFA is null
    }
  }, [currentStep, history, nfa, highlightStates, testString.length]);

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

  // Update the edge highlighting effect to be more pronounced
  useEffect(() => {
    if (edgesDataSet.current) {
      const updates = edgesDataSet.current.getIds().map((edgeId) => ({
        id: String(edgeId),
        color: {
          color: activeTransitions.has(String(edgeId)) ? COLORS.active.background : COLORS.edges.default,
          highlight: COLORS.edges.highlight,
          hover: COLORS.edges.hover,
        },
        width: activeTransitions.has(String(edgeId)) ? 5 : 2,
        shadow: activeTransitions.has(String(edgeId)) ? {
          enabled: true,
          color: 'rgba(245, 158, 11, 0.8)',
          size: 15,
          x: 0,
          y: 0
        } : false
      }));
      edgesDataSet.current.update(updates);
    }
  }, [activeTransitions]);

  const toggleFullscreen = useCallback(() => {
    console.log("Fullscreen button clicked, navigating...");
    // We always navigate to the fullscreen page when this is called from the main page
    // Encode the regex using base64 for the URL parameter
    const encodedRegex = btoa(localRegexInput);
    router.push(`/fullscreen?regex=${encodedRegex}`);
  }, [localRegexInput, router]);

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
              className="w-full"
              onToggleFullscreen={toggleFullscreen}
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

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
