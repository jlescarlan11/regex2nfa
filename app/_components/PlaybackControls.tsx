// components/PlaybackControls.tsx
"use client";
import React from "react";
import { Flex, IconButton, Tooltip, Box, Text } from "@radix-ui/themes";
import {
  LuPlay,
  LuPause,
  LuRotateCcw,
  LuSkipForward,
  LuSkipBack,
} from "react-icons/lu";

interface PlaybackControlsProps {
  onStepBackward: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  canStepBack: boolean;
  canPlay: boolean;
  canStepForward: boolean;
  isPlaying: boolean;
  disabled: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
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
    <Box>
      <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
        Controls
      </Text>
      <Flex
        align="center"
        justify="center"
        gap="2"
        p="2"
        style={{
          backgroundColor: "var(--gray-a2)",
          borderRadius: "var(--radius-2)",
          border: "1px solid var(--gray-a5)",
        }}
      >
        {/* Reset */}
        <Tooltip content="Reset (R)">
          <IconButton
            size="2"
            variant="soft"
            color="gray"
            onClick={onReset}
            disabled={disabled}
          >
            <LuRotateCcw className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        {/* Step Back */}
        <Tooltip content="Step Back (←)">
          <IconButton
            size="2"
            variant="soft"
            color="gray"
            onClick={onStepBackward}
            disabled={!canStepBack || disabled}
          >
            <LuSkipBack className="w-4 h-4" />
          </IconButton>
        </Tooltip>

        {/* Play/Pause - Main Action */}
        <Tooltip content={isPlaying ? "Pause (Space)" : "Play (Space)"}>
          <IconButton
            size="3"
            variant="solid"
            color={isPlaying ? "orange" : "green"}
            onClick={onPlayPause}
            disabled={!canPlay || disabled}
            highContrast
          >
            {isPlaying ? (
              <LuPause className="w-5 h-5" />
            ) : (
              <LuPlay className="w-5 h-5" />
            )}
          </IconButton>
        </Tooltip>

        {/* Step Forward */}
        <Tooltip content="Step Forward (→)">
          <IconButton
            size="2"
            variant="soft"
            color="gray"
            onClick={onStepForward}
            disabled={!canStepForward || disabled}
          >
            <LuSkipForward className="w-4 h-4" />
          </IconButton>
        </Tooltip>
      </Flex>
    </Box>
  );
};
