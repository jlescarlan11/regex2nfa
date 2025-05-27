// components/SimulationPanel.tsx
"use client";
import React from "react";
import { Flex, Text, TextField, Box } from "@radix-ui/themes";
import { LuCircleAlert, LuTimer } from "react-icons/lu";
import type { State, Transition } from "@/app/_types/nfa";
import { AnimationControls } from "./AnimationControls";
import { PlaybackControls } from "./PlaybackControls";
import { SimulationStatus } from "./SimulationStatus";
import { KeyboardHints } from "./KeyboardHints";

interface SimulationPanelProps {
  testString: string;
  setTestString: (value: string) => void;
  nfa: { start: State; end: State; transitions: Transition[] } | null;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  handleStepBackward: () => void;
  currentStep: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  handleStepForward: () => void;
  isAccepted: boolean;
  history: Set<State>[];
  handleResetSimulation: () => void;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({
  testString,
  setTestString,
  nfa,
  animationSpeed,
  setAnimationSpeed,
  handleStepBackward,
  currentStep,
  isPlaying,
  setIsPlaying,
  handleStepForward,
  isAccepted,
  history,
  handleResetSimulation,
}) => {
  const isComplete =
    currentStep === testString.length &&
    (history.length > currentStep || testString.length === 0);

  const canStepBack = currentStep > 0 && !!nfa && !isPlaying;
  const canPlay =
    !!nfa && testString.length > 0 && currentStep < testString.length;
  const canStepForward =
    !!nfa &&
    testString.length > 0 &&
    currentStep < testString.length &&
    !isPlaying;
  const simulationDisabled = !nfa;

  return (
    <Box p="3" className="w-full max-w-full">
      <Flex direction="column" gap="3">
        {/* Header */}
        <Box>
          <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
            NFA Simulation
            {nfa && (
              <LuTimer className="inline-block w-4 h-4 ml-2 text-gray-500" />
            )}
          </Text>
        </Box>

        {/* Input Section */}
        <Box>
          <Text
            as="label"
            htmlFor="testStringInput"
            size="2"
            weight="medium"
            mb="2"
            style={{ display: "block" }}
          >
            Test String
          </Text>
          <TextField.Root
            id="testStringInput"
            placeholder="Enter string to test..."
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            disabled={simulationDisabled}
            size="2"
            color={simulationDisabled ? "gray" : undefined}
          >
            {simulationDisabled && (
              <TextField.Slot>
                <LuCircleAlert color="var(--gray-8)" />
              </TextField.Slot>
            )}
          </TextField.Root>

          {simulationDisabled && (
            <Box
              p="2"
              mt="2"
              style={{
                backgroundColor: "var(--amber-a3)",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--amber-a6)",
              }}
            >
              <Flex align="center" gap="2">
                <LuCircleAlert
                  className="w-3 h-3"
                  style={{ color: "var(--amber-9)" }}
                />
                <Text size="1" color="amber" weight="medium">
                  Generate an NFA first to enable simulation
                </Text>
              </Flex>
            </Box>
          )}
        </Box>

        {/* Animation Speed Control */}
        <AnimationControls
          speed={animationSpeed}
          onSpeedChange={setAnimationSpeed}
          disabled={simulationDisabled}
        />

        {/* Playback Controls */}
        <PlaybackControls
          onStepBackward={handleStepBackward}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onStepForward={handleStepForward}
          onReset={handleResetSimulation}
          canStepBack={canStepBack}
          canPlay={canPlay}
          canStepForward={canStepForward}
          isPlaying={isPlaying}
          disabled={simulationDisabled}
        />

        {/* Simulation Status */}
        {nfa && (
          <SimulationStatus
            testString={testString}
            currentStep={currentStep}
            isAccepted={isAccepted}
            isComplete={isComplete}
          />
        )}

        {/* Keyboard Hints */}
        {nfa && <KeyboardHints />}
      </Flex>
    </Box>
  );
};

export default SimulationPanel;
