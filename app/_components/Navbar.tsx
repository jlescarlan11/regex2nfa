// components/NavBar.tsx
"use client"; // Add "use client" if using hooks like usePathname

import React from "react";
import { Container, Flex, Text, Heading, Box } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation"; // For active link styling
import Image from "next/image";

const NavLinks = () => {
  const pathname = usePathname();
  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Guide", href: "/guide" },
  ];

  return (
    <Flex asChild gap="4" align="center">
      <ul>
        {links.map((link) => (
          <li key={link.href} style={{ display: "inline-block" }}>
            <Link
              href={link.href}
              className={`nav-link ${
                pathname === link.href ? "nav-link-active" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Flex>
  );
};

const NavBar = () => {
  return (
    <Box style={{ borderBottom: "1px solid var(--gray-a5)" }}>
      <Container>
        <Flex
          justify="between"
          align="center"
          py="3"
          px={{ initial: "3", sm: "0" }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Flex gap="3" align="center">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />
              <Flex direction="column">
                <Heading as="h1" size="4" weight="bold" trim="start">
                  Regex to NFA
                </Heading>
                <Text size="1" color="gray">
                  Visualizer
                </Text>
              </Flex>
            </Flex>
          </Link>
          <NavLinks />
        </Flex>
      </Container>
    </Box>
  );
};

export default NavBar;
