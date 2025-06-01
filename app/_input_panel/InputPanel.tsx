// components/InputPanel.tsx
"use client";
import {
  Box,
  Button,
  Code,
  DropdownMenu,
  Flex,
  IconButton,
  ScrollArea,
  Text,
  TextField,
} from "@radix-ui/themes";
import React, { useState } from "react";
import {
  LuBookOpen,
  LuCheck,
  LuChevronDown,
  LuCircleAlert,
  LuCopy,
  LuPlay,
  LuSparkles,
} from "react-icons/lu";

type RegexExample = {
  pattern: string;
  description: string;
  category: string;
};

const regexExamples: RegexExample[] = [
  { pattern: "", description: "Empty String (ε)", category: "Basic" },
  { pattern: "a", description: "Single character 'a'", category: "Basic" },
  { pattern: "a|b", description: "Alternation: 'a' or 'b'", category: "Basic" },
  {
    pattern: "ab",
    description: "Concatenation: 'a' then 'b'",
    category: "Basic",
  },
  {
    pattern: "a*",
    description: "Kleene Star: zero or more 'a's",
    category: "Quantifiers",
  },
  {
    pattern: "a+",
    description: "Kleene Plus: one or more 'a's",
    category: "Quantifiers",
  },
  {
    pattern: "a?",
    description: "Optional: zero or one 'a'",
    category: "Quantifiers",
  },
  {
    pattern: "(a|b)*c",
    description: "Grouping & Kleene Star",
    category: "Complex",
  },
  { pattern: "a(b|c)d", description: "Nested Grouping", category: "Complex" },
  {
    pattern: "\\*",
    description: "Escaped Asterisk (literal *)",
    category: "Escapes",
  },
  {
    pattern: "\\e",
    description: "Explicit Epsilon Transition",
    category: "Special",
  },
  {
    pattern: "\\(",
    description: "Escaped Parenthesis (literal ( )",
    category: "Escapes",
  },
];

const groupedExamples = regexExamples.reduce((acc, example) => {
  if (!acc[example.category]) acc[example.category] = [];
  acc[example.category].push(example);
  return acc;
}, {} as Record<string, RegexExample[]>);

interface InputPanelProps {
  onVisualize: (pattern: string) => void;
  localRegexInput: string;
  setLocalRegexInput: (value: string) => void;
  error: string | null;
  handleRegexInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  onVisualize,
  localRegexInput,
  setLocalRegexInput,
  error,
  handleRegexInputKeyDown,
}) => {
  const [copiedPattern, setCopiedPattern] = useState<string | null>(null);

  const handleCopy = async (pattern: string) => {
    try {
      await navigator.clipboard.writeText(pattern);
      setCopiedPattern(pattern);
      setTimeout(() => setCopiedPattern(null), 2000);
    } catch (err) {
      console.error("Failed to copy text using navigator.clipboard: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = pattern;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopiedPattern(pattern);
          setTimeout(() => setCopiedPattern(null), 2000);
        } else {
          console.error("Fallback copy command was unsuccessful.");
        }
      } catch (copyErr) {
        console.error("Fallback copy failed: ", copyErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleExampleClick = (pattern: string) => {
    setLocalRegexInput(pattern);
    const inputElement = document.getElementById("regex-input-field");
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleVisualizeClick = () => {
    onVisualize(localRegexInput);
  };

  const internalHandleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleRegexInputKeyDown) {
      handleRegexInputKeyDown(e);
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (localRegexInput.trim()) {
        handleVisualizeClick();
      }
    }
  };

  return (
    <Box p="3" className="w-full max-w-full">
      <Flex direction="column" gap="3">
        {/* Input Label and Field */}
        <Box>
          <Text
            as="label"
            htmlFor="regex-input-field"
            size="2"
            weight="medium"
            mb="2"
            style={{ display: "block" }}
          >
            Pattern
          </Text>

          {/* Stacked layout for narrow space */}
          <Flex direction="column" gap="2">
            {/* Input Field */}
            <TextField.Root
              id="regex-input-field"
              placeholder="a(b|c)*d"
              value={localRegexInput}
              onChange={(e) => setLocalRegexInput(e.target.value)}
              onKeyDown={internalHandleKeyDown}
              aria-label="Regular expression input"
              color={error ? "red" : undefined}
              size="2"
            >
              {error && (
                <TextField.Slot>
                  <LuCircleAlert color="var(--red-9)" />
                </TextField.Slot>
              )}
            </TextField.Root>

            {/* Control Buttons - Stacked */}
            <Flex direction="column" gap="2">
              {/* Examples Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button
                    variant="soft"
                    size="2"
                    color="gray"
                    style={{ width: "100%" }}
                  >
                    <LuSparkles className="w-3 h-3" />
                    Examples
                    <LuChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  size="1"
                  style={{
                    minWidth: "280px",
                    maxWidth: "90vw",
                  }}
                >
                  <ScrollArea
                    type="auto"
                    scrollbars="vertical"
                    style={{ maxHeight: "240px" }}
                  >
                    {Object.entries(groupedExamples).map(
                      ([category, examples], catIndex) => (
                        <Box key={category}>
                          {/* Category Header - Very Subtle */}
                          <Box px="2" py="1">
                            <Text
                              size="1"
                              weight="medium"
                              color="gray"
                              style={{
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                fontSize: "10px",
                              }}
                            >
                              {category}
                            </Text>
                          </Box>

                          {/* Examples in this category */}
                          {examples.map((example, i) => (
                            <DropdownMenu.Item
                              key={`${category}-${i}`}
                              onSelect={() =>
                                handleExampleClick(example.pattern)
                              }
                              style={{
                                cursor: "pointer",
                                padding: "4px 8px",
                                fontSize: "12px",
                              }}
                            >
                              <Flex
                                justify="between"
                                align="center"
                                width="100%"
                              >
                                <Flex
                                  align="center"
                                  gap="2"
                                  style={{ flex: 1, minWidth: 0 }}
                                >
                                  <Code
                                    size="1"
                                    variant="soft"
                                    weight="bold"
                                    style={{
                                      minWidth: "fit-content",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {example.pattern === ""
                                      ? "ε"
                                      : example.pattern}
                                  </Code>
                                  <Text
                                    size="1"
                                    color="gray"
                                    style={{
                                      flex: 1,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {example.description}
                                  </Text>
                                </Flex>

                                <IconButton
                                  size="1"
                                  variant="ghost"
                                  color="gray"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(example.pattern);
                                  }}
                                  aria-label="Copy pattern"
                                  style={{ flexShrink: 0, marginLeft: "4px" }}
                                >
                                  {copiedPattern === example.pattern ? (
                                    <LuCheck
                                      className="w-3 h-3"
                                      style={{ color: "var(--green-9)" }}
                                    />
                                  ) : (
                                    <LuCopy className="w-3 h-3" />
                                  )}
                                </IconButton>
                              </Flex>
                            </DropdownMenu.Item>
                          ))}

                          {/* Separator between categories (except last) */}
                          {catIndex <
                            Object.keys(groupedExamples).length - 1 && (
                            <DropdownMenu.Separator />
                          )}
                        </Box>
                      )
                    )}
                  </ScrollArea>
                </DropdownMenu.Content>
              </DropdownMenu.Root>

              {/* Visualize Button */}
              <Button
                id="visualize-button"
                onClick={handleVisualizeClick}
                disabled={!localRegexInput.trim()}
                aria-label="Visualize"
                size="2"
                style={{
                  cursor: !localRegexInput.trim() ? "not-allowed" : "pointer",
                  width: "100%",
                }}
              >
                <LuPlay className="w-3 h-3" />
                Visualize
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Error Message - Compact */}
        {error && (
          <Box
            p="2"
            style={{
              backgroundColor: "var(--red-a3)",
              borderRadius: "var(--radius-2)",
              border: "1px solid var(--red-a6)",
            }}
          >
            <Flex align="center" gap="2">
              <LuCircleAlert
                className="w-3 h-3"
                style={{ color: "var(--red-9)" }}
              />
              <Text size="1" color="red" weight="medium">
                {error}
              </Text>
            </Flex>
          </Box>
        )}

        {/* Help Text - Very Compact */}
        <Box
          p="2"
          style={{
            backgroundColor: "var(--blue-a2)",
            borderRadius: "var(--radius-2)",
            border: "1px solid var(--blue-a5)",
          }}
        >
          <Flex align="start" gap="2">
            <LuBookOpen
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
                Quick Reference
              </Text>
              <Text size="1" color="gray" style={{ lineHeight: "1.3" }}>
                <Code variant="ghost" size="1">
                  \e
                </Code>{" "}
                = epsilon,
                <Code variant="ghost" size="1" ml="1">
                  ab
                </Code>{" "}
                = concat,
                <Code variant="ghost" size="1" ml="1">
                  a|b
                </Code>{" "}
                = or,
                <Code variant="ghost" size="1" ml="1">
                  a*
                </Code>{" "}
                = zero+
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default InputPanel;
