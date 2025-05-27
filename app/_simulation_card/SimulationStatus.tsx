// components/SimulationStatus.tsx
"use client";
import React from "react";
import { Box, Flex, Text, Badge, Code } from "@radix-ui/themes";
import { LuCheck, LuX } from "react-icons/lu";

interface SimulationStatusProps {
  testString: string;
  currentStep: number;
  isAccepted: boolean;
  isComplete: boolean;
}

export const SimulationStatus: React.FC<SimulationStatusProps> = ({
  testString,
  currentStep,
  isAccepted,
  isComplete,
}) => {
  const processedPart = testString.slice(0, currentStep);
  const currentChar = testString.slice(currentStep, currentStep + 1);
  const remainingPart = testString.slice(currentStep + 1);

  return (
    <Box>
      <Text size="2" weight="medium" mb="2" style={{ display: "block" }}>
        Status
      </Text>

      <Box
        p="3"
        style={{
          backgroundColor: "var(--gray-a2)",
          borderRadius: "var(--radius-3)",
          border: "1px solid var(--gray-a5)",
        }}
      >
        <Flex direction="column" gap="3">
          {/* String Visualization */}
          <Box>
            <Text size="1" color="gray" mb="1" style={{ display: "block" }}>
              Processing String
            </Text>
            <Box
              p="2"
              style={{
                backgroundColor: "var(--color-background)",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-a4)",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Text
                size="2"
                weight="medium"
                style={{
                  fontFamily: "var(--font-mono)",
                  wordBreak: "break-all",
                }}
              >
                {/* Processed characters */}
                <Text color="gray">{processedPart}</Text>
                {/* Current character highlighted */}
                {currentChar && (
                  <Code
                    variant="solid"
                    color="blue"
                    size="1"
                    style={{ margin: "0 1px" }}
                  >
                    {currentChar}
                  </Code>
                )}
                {/* Remaining characters */}
                <Text style={{ opacity: 0.4 }}>{remainingPart}</Text>
                {/* Empty string indicator */}
                {!testString && (
                  <Text color="gray" style={{ fontStyle: "italic" }}>
                    ε (empty string)
                  </Text>
                )}
              </Text>
            </Box>
          </Box>

          {/* Step Counter */}
          <Flex justify="between" align="center">
            <Text size="1" color="gray">
              Step: {currentStep} / {testString.length}
            </Text>
            {isComplete && (
              <Badge
                color={isAccepted ? "green" : "red"}
                variant="solid"
                size="1"
                highContrast
              >
                {isAccepted ? (
                  <LuCheck className="w-3 h-3" />
                ) : (
                  <LuX className="w-3 h-3" />
                )}
                {isAccepted ? "Accepted" : "Rejected"}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
