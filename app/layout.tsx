// app/layout.tsx
import Footer from "@/app/_components/Footer";
import NavBar from "@/app/_components/Navbar"; // Assuming components are in src/components
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // if you want to use Inter specifically with Radix
});

export const metadata: Metadata = {
  title: "Regex to NFA Visualizer",
  description: "Convert regular expressions to NFA and visualize the process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Theme
          appearance="light"
          accentColor="plum"
          grayColor="gray"
          scaling="100%"
        >
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Theme>
      </body>
    </html>
  );
}
