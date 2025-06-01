// components/Footer.tsx
"use client";
import {
  Box,
  Container,
  Flex,
  Link as RadixLink,
  Text,
} from "@radix-ui/themes";
import Link from "next/link";
import React from "react";

const Footer: React.FC = () => {
  return (
    <Box
      style={{
        borderTop: "1px solid var(--gray-a5)",
        backgroundColor: "var(--gray-a1)",
      }}
    >
      <Container>
        <Flex direction="column" align="center" justify="center" py="4" gap="2">
          
          <Text size="1" color="gray">
            © {new Date().getFullYear()} Regex to NFA Visualizer. A CMSC 141 Project.
          </Text>
          <Text size="1" color="gray">
            Built by Escarlan, Arañas, Betonio and Va-ay
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
