// components/KeyboardHints.tsx
"use client";
import { Box, Flex, Kbd, Text } from "@radix-ui/themes";
import React from "react";
import { LuKeyboard } from "react-icons/lu";

export const KeyboardHints: React.FC = () => {
  return (
    <Box
      p="2"
      style={{
        backgroundColor: "var(--blue-a2)",
        borderRadius: "var(--radius-2)",
        border: "1px solid var(--blue-a5)",
      }}
    >
      <Flex align="start" gap="2">
        <LuKeyboard
          className="w-3 h-3 mt-0.5"
          style={{ color: "var(--blue-9)", flexShrink: 0 }}
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="1"
            weight="medium"
            color="blue"
            mb="1"
            style={{ display: "block" }}
          >
            Keyboard Shortcuts
          </Text>
          <Text size="1" color="gray" style={{ lineHeight: "1.3" }}>
            <Kbd size="1">Space</Kbd> = Play/Pause, <Kbd size="1">←→</Kbd> =
            Step, <Kbd size="1">R</Kbd> = Reset
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};
