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
          <Text size="2" color="gray">
            Built with Next.js, Radix UI, and Vis Network.
          </Text>
          <Text size="1" color="gray">
            © {new Date().getFullYear()} Regex to NFA Visualizer. Inspired by
            various similar tools.
          </Text>
          <Flex gap="3" mt="1">
            <RadixLink asChild size="1" highContrast>
              <Link
                href="[https://github.com](https://github.com)"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub (Example)
              </Link>
            </RadixLink>
            <RadixLink asChild size="1" highContrast>
              <Link href="/about">About</Link>
            </RadixLink>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
