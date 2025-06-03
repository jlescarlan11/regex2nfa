"use client";
import { CheckIcon, CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Box,
  Callout,
  Code,
  Container,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

interface Section {
  sections: {
    title: string;
    items: {
      symbol: string;
      description: string;
      example: string;
    }[];
  }[];
  examples: string[];
}

// Guide sections with structured content
const guideData = {
  basics: {
    title: "Regex Basics",
    icon: "📝",
    sections: [
      {
        title: "Basic Operators",
        items: [
          {
            symbol: "|",
            description: "Alternation - matches either option",
            example: "a|b",
          },
          {
            symbol: "*",
            description: "Zero or more repetitions",
            example: "a*",
          },
          {
            symbol: "+",
            description: "One or more repetitions",
            example: "a+",
          },
          { symbol: "?", description: "Optional - zero or one", example: "a?" },
          {
            symbol: "()",
            description: "Grouping expressions",
            example: "(ab)*",
          },
        ],
      },
      {
        title: "Special Characters",
        items: [
          {
            symbol: "\\e",
            description: "Explicit epsilon transition",
            example: "a\\eb",
          },
          {
            symbol: "\\",
            description: "Escape metacharacters",
            example: "\\*\\+",
          },
        ],
      },
    ],
    examples: ["a(b|c)*", "(x|y)+z?", "a\\*b", "\\e"],
  },
  visualization: {
    title: "NFA Visualization",
    icon: "🎨",
    sections: [
      {
        title: "State Types",
        items: [
          {
            symbol: "Start",
            description: "Blue background with 'Start' label",
            example: "",
          },
          {
            symbol: "Accept",
            description: "Green background with 'Accept' label",
            example: "",
          },
          {
            symbol: "Normal",
            description: "Gray background with numeric ID",
            example: "",
          },
          {
            symbol: "Active",
            description: "Yellow highlight during simulation",
            example: "",
          },
        ],
      },
      {
        title: "Transitions",
        items: [
          {
            symbol: "ε",
            description: "Epsilon transitions shown as dashed lines",
            example: "",
          },
          {
            symbol: "a,b,c",
            description: "Symbol transitions as solid colored lines",
            example: "",
          },
        ],
      },
    ],
    examples: [],
  },
  simulation: {
    title: "String Simulation",
    icon: "▶️",
    sections: [
      {
        title: "Controls",
        items: [
          {
            symbol: "→",
            description: "Step forward through input",
            example: "",
          },
          {
            symbol: "←",
            description: "Step backward through input",
            example: "",
          },
          { symbol: "⏯", description: "Auto-play simulation", example: "" },
          { symbol: "⚡", description: "Adjust animation speed", example: "" },
        ],
      },
      {
        title: "Understanding Results",
        items: [
          {
            symbol: "✅",
            description: "String accepted - ends in accept state",
            example: "",
          },
          {
            symbol: "❌",
            description: "String rejected - no valid path",
            example: "",
          },
        ],
      },
    ],
    examples: [],
  },
};

// Reusable Components
const ExampleCode = ({
  examples,
  onExampleClick,
}: {
  examples: string[];
  onExampleClick: (example: string) => void;
}) => {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(text);
      setTimeout(() => setCopiedExample(null), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  if (!examples || examples.length === 0) return null;

  return (
    <Box mt="3">
      <Text size="2" weight="medium" color="gray" mb="2">
        Try these examples:
      </Text>
      <Flex direction="column" gap="2">
        {examples.map((example, index) => (
          <Flex key={index} align="center" gap="2" className="group">
            <Code
              variant="soft"
              className="flex-1 cursor-pointer hover:bg-gray-4 transition-colors"
              onClick={() => onExampleClick?.(example)}
              title="Click to use this example"
            >
              {example}
            </Code>
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              onClick={() => handleCopy(example)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedExample === example ? <CheckIcon /> : <CopyIcon />}
            </IconButton>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};

const GuideSection = ({
  section,
  onExampleClick,
}: {
  section: Section;
  onExampleClick: (example: string) => void;
}) => (
  <Box>
    {section.sections.map((subsection, idx) => (
      <Box key={idx} mb="4">
        <Heading size="3" color="gray" mb="3">
          {subsection.title}
        </Heading>
        <Flex direction="column" gap="2">
          {subsection.items.map((item, itemIdx) => (
            <Flex key={itemIdx} align="start" gap="3" className="group">
              <Box className="min-w-0 flex-shrink-0">
                <Code variant="soft" size="2" className="whitespace-nowrap">
                  {item.symbol}
                </Code>
              </Box>
              <Box className="min-w-0 flex-1">
                <Text size="2" color="gray" className="leading-relaxed">
                  {item.description}
                </Text>
                {item.example && (
                  <Code
                    variant="ghost"
                    size="1"
                    className="mt-1 cursor-pointer hover:bg-gray-3 transition-colors"
                    onClick={() => onExampleClick?.(item.example)}
                  >
                    {item.example}
                  </Code>
                )}
              </Box>
            </Flex>
          ))}
        </Flex>
      </Box>
    ))}

    <ExampleCode examples={section.examples} onExampleClick={onExampleClick} />
  </Box>
);

const QuickStart = ({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) => (
  <Callout.Root color="blue" className="mb-6">
    <Callout.Icon>
      <InfoCircledIcon />
    </Callout.Icon>
    <Callout.Text>
      <Text weight="medium">Quick Start: </Text>
      Try entering{" "}
      <Code
        variant="soft"
        className="cursor-pointer hover:bg-blue-4 transition-colors"
        onClick={() => onExampleClick?.("a*b")}
      >
        a*b
      </Code>{" "}
      to see a simple NFA, then test it with strings like{" "}
      <Code variant="ghost">aaab</Code> or <Code variant="ghost">b</Code>.
    </Callout.Text>
  </Callout.Root>
);

// Main Guide Component
const RegexNFAGuide = ({
  onExampleClick,
}: {
  onExampleClick: (example: string) => void;
}) => {
  return (
    <Container>
      <ScrollArea type="scroll" scrollbars="vertical" className="h-screen">
        <Box p="4">
          {/* Header */}
          <Box mb="6">
            <Heading size="5" weight="bold" mb="2">
              Regex to NFA Guide
            </Heading>
            <Text size="3" color="gray" className="leading-relaxed">
              Learn how to create regular expressions and visualize them as NFAs
            </Text>
          </Box>

          <QuickStart onExampleClick={onExampleClick} />

          {/* Tabs Container */}
          <Tabs.Root
            className="flex w-full flex-col shadow-[0_2px_10px] shadow-gray-200 rounded-lg overflow-hidden"
            defaultValue="basics"
          >
            <Tabs.List
              className="flex shrink-0 border-b border-gray-300 bg-gray-50"
              aria-label="Regex NFA Guide sections"
            >
              {Object.entries(guideData).map(([key, section]) => (
                <Tabs.Trigger
                  key={key}
                  className="flex h-[50px] flex-1 cursor-pointer select-none items-center justify-center bg-transparent px-5 text-[14px] font-medium leading-none text-gray-600 outline-none transition-all duration-200 first:rounded-tl-lg last:rounded-tr-lg hover:text-blue-600 hover:bg-gray-100 data-[state=active]:text-blue-700 data-[state=active]:bg-white data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-blue-600 data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-blue-200"
                  value={key}
                >
                  <Flex align="center" gap="2">
                    <Text className="text-lg">{section.icon}</Text>
                    <Text>{section.title}</Text>
                  </Flex>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {Object.entries(guideData).map(([key, section]) => (
              <Tabs.Content
                key={key}
                className="grow rounded-b-lg bg-white p-6 outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-200 min-h-[400px]"
                value={key}
              >
                <GuideSection
                  section={section}
                  onExampleClick={onExampleClick}
                />
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Box>
      </ScrollArea>
    </Container>
  );
};

const GuidePage = () => {
  // This can be replaced with navigation or other logic as needed
  const handleExampleClick = (example: string) => {
    // For now, just copy to clipboard
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(example);
    }
  };
  return <RegexNFAGuide onExampleClick={handleExampleClick} />;
};

export default GuidePage;
