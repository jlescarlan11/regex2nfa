// components/SimulationCard.tsx
"use client";
import React from "react";
import {
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Button,
  Slider,
  Badge,
  Box,
  Tooltip,
  IconButton,
  Inset,
  Separator,
  Kbd,
} from "@radix-ui/themes";
import {
  PlayIcon,
  PauseIcon,
  ResetIcon,
  TrackNextIcon,
  TrackPreviousIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LapTimerIcon,
} from "@radix-ui/react-icons";
import type { State, Transition } from "@/app/_types/nfa";

interface SimulationCardProps {
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
  history: Set<State>[]; // To determine if simulation is complete
  handleResetSimulation: () => void;
}

const AnimationSpeedControl: React.FC<{
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  disabled: boolean;
}> = ({ animationSpeed, setAnimationSpeed, disabled }) => {
  const speedPresets = [
    { label: "Fast", value: 300 },
    { label: "Norm", value: 800 },
    { label: "Slow", value: 1500 },
  ];

  return (
    <Flex direction="column" gap="2" align="stretch">
      <Flex justify="between" align="center">
        <Text size="1" color="gray">
          Animation Speed
        </Text>
        <Badge
          variant="soft"
          color="gray"
          highContrast
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {animationSpeed}ms
        </Badge>
      </Flex>
      <Slider
        value={[animationSpeed]}
        onValueChange={(value) => setAnimationSpeed(value[0])}
        min={100}
        max={2000}
        step={50}
        disabled={disabled}
        aria-label="Animation Speed Slider"
      />
      <Flex gap="2" justify="center">
        {speedPresets.map(({ label, value }) => (
          <Button
            key={value}
            size="1"
            variant={animationSpeed === value ? "solid" : "soft"}
            color="gray"
            highContrast={animationSpeed === value}
            onClick={() => setAnimationSpeed(value)}
            disabled={disabled}
            style={{ flexGrow: 1 }}
          >
            {label}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};

const PlaybackControls: React.FC<{
  onStepBackward: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  canStepBack: boolean;
  canPlay: boolean;
  canStepForward: boolean;
  isPlaying: boolean;
  disabled: boolean;
}> = ({
  onStepBackward,
  onPlayPause,
  onStepForward,
  onReset,
  canStepBack,
  canPlay,
  canStepForward,
  isPlaying,
  disabled,
}) => {
  return (
    <Flex align="center" justify="center" gap="2">
      <Tooltip content="Reset Simulation (R)">
        <IconButton
          size="2"
          variant="outline"
          color="gray"
          onClick={onReset}
          disabled={disabled}
        >
          <ResetIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content="Step Backward (←)">
        <IconButton
          size="2"
          variant="outline"
          color="gray"
          onClick={onStepBackward}
          disabled={!canStepBack || disabled}
        >
          <TrackPreviousIcon />
        </IconButton>
      </Tooltip>
      <Tooltip content={isPlaying ? "Pause (Space)" : "Play (Space)"}>
        <IconButton
          size="3"
          variant="solid"
          color={isPlaying ? "amber" : "green"}
          onClick={onPlayPause}
          disabled={!canPlay || disabled}
          highContrast
        >
          {isPlaying ? (
            <PauseIcon width="20" height="20" />
          ) : (
            <PlayIcon width="20" height="20" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip content="Step Forward (→)">
        <IconButton
          size="2"
          variant="outline"
          color="gray"
          onClick={onStepForward}
          disabled={!canStepForward || disabled}
        >
          <TrackNextIcon />
        </IconButton>
      </Tooltip>
    </Flex>
  );
};

const SimulationStatus: React.FC<{
  testString: string;
  currentStep: number;
  isAccepted: boolean;
  isComplete: boolean;
}> = ({ testString, currentStep, isAccepted, isComplete }) => {
  const processedPart = testString.slice(0, currentStep);
  const currentChar = testString.slice(currentStep, currentStep + 1);
  const remainingPart = testString.slice(currentStep + 1);

  return (
    <Box
      p="3"
      style={{
        backgroundColor: "var(--gray-a2)",
        borderRadius: "var(--radius-3)",
        border: "1px solid var(--gray-a5)",
      }}
    >
      <Flex direction="column" gap="2">
        <Text size="1" color="gray" align="center">
          Processing String
        </Text>
        <Text
          size="3"
          weight="bold"
          align="center"
          className="break-words"
          style={{
            fontFamily: "var(--font-mono)",
            minHeight: "var(--line-height-5)",
          }}
        >
          <Text color="gray">{processedPart}</Text>
          <Text
            style={{
              backgroundColor: "var(--accent-a5)",
              color: "var(--accent-11)",
              padding: "0 var(--space-1)",
              borderRadius: "var(--radius-1)",
            }}
          >
            {currentChar || (isComplete && !testString ? "ε" : "")}
          </Text>
          <Text style={{ opacity: 0.5 }}>{remainingPart}</Text>
          {!testString && !isComplete && (
            <Text color="gray" style={{ fontStyle: "italic" }}>
              empty string
            </Text>
          )}
        </Text>
        <Flex justify="between" align="center">
          <Text size="1" color="gray">
            Step: {currentStep} / {testString.length}
          </Text>
          {isComplete && (
            <Badge
              color={isAccepted ? "green" : "red"}
              variant="solid"
              highContrast
            >
              {isAccepted ? <CheckCircledIcon /> : <CrossCircledIcon />}
              {isAccepted ? "Accepted" : "Rejected"}
            </Badge>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

const SimulationCard: React.FC<SimulationCardProps> = ({
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
            NFA Simulation
          </Heading>
          {nfa && <LapTimerIcon color="var(--gray-10)" />}
        </Flex>
      </Inset>

      <Box p="4">
        <Flex direction="column" gap="4">
          <TextField.Root
            id="testStringInput"
            placeholder="Enter string to test..."
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            disabled={simulationDisabled}
            aria-label="Test String Input"
            size="2"
          >
            <TextField.Slot>
              {simulationDisabled && <InfoCircledIcon color="var(--gray-8)" />}
            </TextField.Slot>
          </TextField.Root>

          {simulationDisabled && (
            <Text size="1" color="amber">
              <Flex gap="1" align="center">
                <InfoCircledIcon /> Generate an NFA first to enable simulation.
              </Flex>
            </Text>
          )}

          <AnimationSpeedControl
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            disabled={simulationDisabled}
          />

          <Separator size="4" my="0" />

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

          {nfa && (
            <SimulationStatus
              testString={testString}
              currentStep={currentStep}
              isAccepted={isAccepted}
              isComplete={isComplete}
            />
          )}

          {nfa && (
            <Text
              size="1"
              color="gray"
              align="center"
              style={{
                backgroundColor: "var(--gray-a2)",
                padding: "var(--space-2)",
                borderRadius: "var(--radius-2)",
              }}
            >
              Keyboard: <Kbd style={{ fontWeight: "bold" }}>Space</Kbd>{" "}
              (Play/Pause), <Kbd style={{ fontWeight: "bold" }}>←</Kbd>/
              <Kbd style={{ fontWeight: "bold" }}>→</Kbd> (Step),{" "}
              <Kbd style={{ fontWeight: "bold" }}>R</Kbd> (Reset)
            </Text>
          )}
        </Flex>
      </Box>
    </Card>
  );
};

export default SimulationCard;
