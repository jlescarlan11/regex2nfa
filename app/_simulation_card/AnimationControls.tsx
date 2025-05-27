// components/AnimationControls.tsx
"use client";
import React from "react";
import { Flex, Text, Button, Slider, Badge, Box } from "@radix-ui/themes";

interface AnimationControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled: boolean;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  speed,
  onSpeedChange,
  disabled,
}) => {
  const presets = [
    { label: "Fast", value: 300 },
    { label: "Med", value: 800 },
    { label: "Slow", value: 1500 },
  ];

  return (
    <Box>
      <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
        Animation Speed
      </Text>
      <Flex direction="column" gap="2">
        {/* Header with Speed Display */}
        <Flex justify="between" align="center">
          <Text size="1" color="gray">
            Speed
          </Text>
          <Badge
            variant="soft"
            size="1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {speed}ms
          </Badge>
        </Flex>

        {/* Slider */}
        <Slider
          value={[speed]}
          onValueChange={(value) => onSpeedChange(value[0])}
          min={100}
          max={2000}
          step={50}
          disabled={disabled}
          size="1"
        />

        {/* Preset Buttons */}
        <Flex gap="2">
          {presets.map(({ label, value }) => (
            <Button
              key={value}
              size="1"
              variant={speed === value ? "solid" : "soft"}
              color={speed === value ? "blue" : "gray"}
              onClick={() => onSpeedChange(value)}
              disabled={disabled}
              style={{ flex: 1 }}
            >
              {label}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};
