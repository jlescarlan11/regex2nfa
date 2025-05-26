// components/GuideCard.tsx
"use client";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  KeyboardIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Callout,
  Card,
  Code,
  Flex,
  Heading,
  IconButton,
  Inset,
  ScrollArea,
  Separator,
  Strong,
  Tabs,
  Text,
} from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { LuLightbulb } from "react-icons/lu";

// Ensure all sections have an 'examples' property, even if empty, for consistent typing.
const GUIDE_SECTIONS = [
  {
    id: "regex-input",
    title: "Regex Input",
    icon: "📝",
    content: [
      "Enter a regex using supported operators:",
      "• `|` (alternation): `a|b` (matches 'a' or 'b')",
      "• Concatenation (implicit): `ab` (matches 'a' then 'b')",
      "• `*` (Kleene star): `a*` (zero or more 'a's)",
      "• `+` (Kleene plus): `a+` (one or more 'a's)",
      "• `?` (optional): `a?` (zero or one 'a')",
      "• `()` for grouping: `(a|b)c`",
      "• `\\e` for explicit epsilon transitions",
      "• Use `\\` to escape metacharacters: `\\*`, `\\+`, `\\(`, etc.",
    ],
    examples: ["a(b|c)*d", "(x|y)+z?", "a\\*b", "\\e"] as const,
  },
  {
    id: "nfa-visualization",
    title: "NFA Visualization",
    icon: "🎨",
    content: [
      "State representations:",
      "• Start state: Blue background, 'Start' label.",
      "• Accept states: Green background, 'Accept' label.",
      "• Normal states: Gray background, numeric ID.",
      "• Active states (during simulation): Yellow highlight.",
      "Transition representations:",
      "• Epsilon (ε) transitions: Dashed lines.",
      "• Symbol transitions: Solid lines, colored by symbol (e.g., 'a' in red).",
    ],
    examples: [] as const, // Added empty examples for type consistency
  },
  {
    id: "simulation",
    title: "String Simulation",
    icon: "▶️",
    content: [
      "Test strings against the generated NFA:",
      "• Enter a test string in the simulation panel.",
      "• Use Step Forward (→) and Step Back (←) to control execution manually.",
      "• Press Play/Pause (Spacebar) for automatic stepping.",
      "• Adjust animation speed with the slider.",
      "• Active states show the NFA's current possible positions.",
    ],
    examples: [] as const, // Added empty examples for type consistency
  },
  {
    id: "results",
    title: "Interpreting Results",
    icon: "📊",
    content: [
      "Understanding acceptance:",
      "• A string is accepted if, after processing all its characters, at least one of the NFA's active states is an Accept state.",
      "• The simulation panel will indicate 'Accepted' (green) or 'Rejected' (red).",
    ],
    examples: [] as const, // Added empty examples for type consistency
  },
] as const;

type GuideSectionType = (typeof GUIDE_SECTIONS)[number];

const CodeExamples: React.FC<{
  examples: readonly string[];
  onExampleClick: (example: string) => void;
}> = ({ examples, onExampleClick }) => {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      // Attempt to use the modern navigator.clipboard API
      await navigator.clipboard.writeText(text);
      setCopiedExample(text);
      setTimeout(() => setCopiedExample(null), 1500);
    } catch (err) {
      console.error("Failed to copy example using navigator.clipboard:", err);
      // Fallback for environments where navigator.clipboard is not available or fails (e.g., insecure contexts)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Prevent scrolling to bottom
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedExample(text);
        setTimeout(() => setCopiedExample(null), 1500);
      } catch (copyErr) {
        console.error(
          "Fallback copy using document.execCommand failed:",
          copyErr
        );
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Flex wrap="wrap" gap="2" mt="2">
      {examples.map((example, index) => (
        <Flex
          key={index}
          align="center"
          gap="1"
          style={{
            padding: "var(--space-1) var(--space-2)",
            backgroundColor: "var(--gray-a3)",
            borderRadius: "var(--radius-2)",
            border: "1px solid var(--gray-a5)",
          }}
        >
          <Code
            variant="ghost"
            onClick={() => onExampleClick(example)}
            style={{ cursor: "pointer", flexGrow: 1 }}
            title="Click to use this example"
          >
            {example}
          </Code>
          <IconButton
            size="1"
            variant="ghost"
            color="gray"
            onClick={() => handleCopy(example)}
            title="Copy example"
          >
            {copiedExample === example ? <CheckIcon /> : <CopyIcon />}
          </IconButton>
        </Flex>
      ))}
    </Flex>
  );
};

const GuideSectionContent: React.FC<{
  section: GuideSectionType;
  onExampleClick: (example: string) => void;
}> = ({ section, onExampleClick }) => (
  <Box p="1">
    {" "}
    {/* Reduced padding for individual section content */}
    <Heading size="3" mb="2" color="gray">
      <Flex align="center" gap="2">
        <Text>{section.icon}</Text> {section.title}
      </Flex>
    </Heading>
    <Flex direction="column" gap="2">
      {section.content.map((line, index) => (
        <Text
          as="p"
          key={index}
          size="2"
          color="gray"
          style={{ lineHeight: "var(--line-height-3)" }}
        >
          {line.startsWith("•") ? (
            <Flex as="span" gap="1">
              <Text color="gray" style={{ marginLeft: "var(--space-3)" }}>
                {line}
              </Text>
            </Flex>
          ) : (
            line
          )}
        </Text>
      ))}
      {/* section.examples will always exist now, so we only need to check its length */}
      {section.examples.length > 0 && (
        <CodeExamples
          examples={section.examples}
          onExampleClick={onExampleClick}
        />
      )}
    </Flex>
  </Box>
);

const KeyboardShortcutsInfo: React.FC = () => (
  <Box
    mt="3"
    p="3"
    style={{
      backgroundColor: "var(--gray-a2)",
      borderRadius: "var(--radius-3)",
      border: "1px solid var(--gray-a5)",
    }}
  >
    <Heading size="2" mb="2">
      <Flex align="center" gap="2">
        <KeyboardIcon /> Keyboard Shortcuts
      </Flex>
    </Heading>
    <Flex direction="column" gap="1">
      <Flex justify="between">
        <Text size="2" color="gray">
          Step Forward:
        </Text>{" "}
        <Code variant="ghost">→</Code>
      </Flex>
      <Flex justify="between">
        <Text size="2" color="gray">
          Step Back:
        </Text>{" "}
        <Code variant="ghost">←</Code>
      </Flex>
      <Flex justify="between">
        <Text size="2" color="gray">
          Play/Pause Simulation:
        </Text>{" "}
        <Code variant="ghost">Space</Code>
      </Flex>
      <Flex justify="between">
        <Text size="2" color="gray">
          Toggle This Guide:
        </Text>{" "}
        <Code variant="ghost">?</Code>
      </Flex>
    </Flex>
  </Box>
);

const GuideCard: React.FC<{ onExampleClick: (example: string) => void }> = ({
  onExampleClick,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Check if the event target is an input, textarea, or select element
        if (
          !(target instanceof HTMLInputElement) &&
          !(target instanceof HTMLTextAreaElement) &&
          !(target instanceof HTMLSelectElement) &&
          !target.isContentEditable // Also check for contentEditable elements
        ) {
          e.preventDefault();
          setIsGuideOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <Card size="3" style={{ overflow: "hidden" }}>
      {" "}
      {/* Added overflow: hidden to Card for better Inset behavior */}
      <Inset clip="padding-box" side="top" pb="current">
        {/* Use a button element for the clickable header for accessibility and to fix type error */}
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          aria-expanded={isGuideOpen}
          aria-controls="guide-content-area"
          style={{
            width: "100%",
            background: "var(--gray-a2)",
            border: "none",
            borderBottom: "1px solid var(--gray-a5)",
            padding: 0, // Reset button padding
            cursor: "pointer",
            textAlign: "left", // Ensure text aligns left
          }}
        >
          <Flex
            justify="between"
            align="center"
            py="3" // Padding applied to Flex
            px="4" // Padding applied to Flex
            // Style moved to the button or inherited
          >
            <Flex align="center" gap="2">
              <QuestionMarkCircledIcon width="18" height="18" />
              <Heading size="4" weight="medium">
                How to Use This Tool
              </Heading>
              <Badge color="gray" variant="soft" highContrast>
                Press ?
              </Badge>
            </Flex>
            {isGuideOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Flex>
        </button>
      </Inset>
      {isGuideOpen && (
        <Box id="guide-content-area" p="4">
          <Tabs.Root defaultValue={GUIDE_SECTIONS[0].id}>
            <ScrollArea type="scroll" scrollbars="horizontal">
              {" "}
              {/* Fixed: "x" to "horizontal" */}
              <Tabs.List>
                {GUIDE_SECTIONS.map((section) => (
                  <Tabs.Trigger key={section.id} value={section.id}>
                    <Flex align="center" gap="1">
                      <Text>{section.icon}</Text> {section.title.split(" ")[0]}
                    </Flex>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </ScrollArea>
            <Box pt="3">
              {GUIDE_SECTIONS.map((section) => (
                <Tabs.Content key={section.id} value={section.id}>
                  <GuideSectionContent
                    section={section}
                    onExampleClick={onExampleClick}
                  />
                </Tabs.Content>
              ))}
            </Box>
          </Tabs.Root>
          <Separator size="4" my="3" />
          <KeyboardShortcutsInfo />
          <Callout.Root mt="4" color="blue" highContrast>
            <Callout.Icon>
              <LuLightbulb />
            </Callout.Icon>
            <Callout.Text>
              <Strong>Pro Tip:</Strong> Start with simple expressions like{" "}
              <Code>a*b</Code> or <Code>(a|b)*</Code> to get familiar with the
              visualization.
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}
    </Card>
  );
};

export default GuideCard;
