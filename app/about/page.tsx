"use client";

import {
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Separator,
  Text,
} from "@radix-ui/themes";
import { LuArrowRight, LuBookOpen, LuCode, LuGithub, LuInfo } from "react-icons/lu";

const AboutPage = () => {
  return (
    <Container>
      <Box className="py-8">
        <Heading size="6" mb="4" className="text-center">
          About Regex2NFA
        </Heading>
        
        <Grid columns={{ initial: "1", md: "2" }} gap="4">
          {/* What is Regex2NFA */}
          <Card className="p-6">
            <Flex gap="3" mb="4">
              <LuInfo className="w-6 h-6 text-blue-500" />
              <Heading size="4">What is Regex2NFA?</Heading>
            </Flex>
            <Text as="p" size="2" mb="3">
              Regex2NFA is an interactive tool that helps you understand how regular expressions are converted into Non-deterministic Finite Automata (NFAs). It provides a visual representation of the conversion process and allows you to simulate how the NFA processes input strings.
            </Text>
            <Text as="p" size="2">
              This tool is particularly useful for:
            </Text>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li className="text-sm">Learning about regular expressions and NFAs</li>
              <li className="text-sm">Understanding the conversion process</li>
              <li className="text-sm">Debugging and testing regular expressions</li>
              <li className="text-sm">Visualizing automata theory concepts</li>
            </ul>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <Flex gap="3" mb="4">
              <LuCode className="w-6 h-6 text-green-500" />
              <Heading size="4">Key Features</Heading>
            </Flex>
            <Grid columns="1" gap="3">
              <Box>
                <Text as="p" size="2" weight="bold" mb="1">
                  Interactive Visualization
                </Text>
                <Text as="p" size="2" color="gray">
                  Drag nodes, zoom in/out, and explore the NFA structure
                </Text>
              </Box>
              <Box>
                <Text as="p" size="2" weight="bold" mb="1">
                  Step-by-Step Simulation
                </Text>
                <Text as="p" size="2" color="gray">
                  Watch how the NFA processes each character of your input
                </Text>
              </Box>
              <Box>
                <Text as="p" size="2" weight="bold" mb="1">
                  Example Patterns
                </Text>
                <Text as="p" size="2" color="gray">
                  Pre-built examples to help you get started
                </Text>
              </Box>
            </Grid>
          </Card>

          {/* How to Use */}
          <Card className="p-6">
            <Flex gap="3" mb="4">
              <LuBookOpen className="w-6 h-6 text-amber-500" />
              <Heading size="4">How to Use</Heading>
            </Flex>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <Text as="span" size="2" weight="bold" className="text-blue-500">
                  1.
                </Text>
                <Box>
                  <Text as="p" size="2" weight="bold" mb="1">
                    Enter a Regular Expression
                  </Text>
                  <Text as="p" size="2" color="gray">
                    Use operators like | (or), * (zero or more), + (one or more), ? (optional), and () for grouping
                  </Text>
                </Box>
              </li>
              <li className="flex gap-3">
                <Text as="span" size="2" weight="bold" className="text-blue-500">
                  2.
                </Text>
                <Box>
                  <Text as="p" size="2" weight="bold" mb="1">
                    Visualize the NFA
                  </Text>
                  <Text as="p" size="2" color="gray">
                    Click the Visualize button to see the NFA representation
                  </Text>
                </Box>
              </li>
              <li className="flex gap-3">
                <Text as="span" size="2" weight="bold" className="text-blue-500">
                  3.
                </Text>
                <Box>
                  <Text as="p" size="2" weight="bold" mb="1">
                    Test with Strings
                  </Text>
                  <Text as="p" size="2" color="gray">
                    Enter test strings and use the simulation controls to see how the NFA processes them
                  </Text>
                </Box>
              </li>
            </ol>
          </Card>

          {/* Resources */}
          <Card className="p-6">
            <Flex gap="3" mb="4">
              <LuGithub className="w-6 h-6 text-purple-500" />
              <Heading size="4">Resources</Heading>
            </Flex>
            <Box className="space-y-3">
              <Link
                href="https://github.com/yourusername/regex2nfa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <LuGithub className="w-4 h-4" />
                View on GitHub
                <LuArrowRight className="w-3 h-3" />
              </Link>
              <Separator size="2" />
              <Text as="p" size="2" color="gray">
                Built with Next.js, React, and vis.js
              </Text>
            </Box>
          </Card>
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutPage; 