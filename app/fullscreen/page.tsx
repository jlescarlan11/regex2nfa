'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Network } from 'vis-network';
import NfaVisualizer from '@/app/_nfa_visualizer/NfaVisualizer';
import { buildNFAFromPostfix } from '@/app/_utils/nfa';
import { parseRegexToPostfix } from '@/app/_utils/regex';
import type { State, Transition } from '@/app/_types/nfa';
import { useRouter } from 'next/navigation';

const FullscreenPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const regex = searchParams.get('regex');
  const router = useRouter();

  console.log("Fullscreen page loaded. Regex param:", regex);

  const [nfa, setNFA] = useState<{ start: State; end: State; transitions: Transition[] } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null!);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (regex) {
      try {
        // Decode the base64 encoded regex
        const decodedRegex = atob(regex);
        console.log("Decoded regex:", decodedRegex);
        const postfix = parseRegexToPostfix(decodedRegex);
        const newNfa = buildNFAFromPostfix(postfix);
        console.log("NFA built successfully:", newNfa);
        setNFA(newNfa);
      } catch (error) {
        console.error('Error building NFA in fullscreen:', error);
        setNFA(null);
      }
    } else {
      console.log("No regex param found.");
      setNFA(null);
    }
  }, [regex]);

  const handleResetLayout = () => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: { duration: 500, easingFunction: 'easeInOutQuad' },
      });
    }
  };

  // Function to handle exiting fullscreen
  const handleExitFullscreen = () => {
    if (regex) {
      // Navigate back to the home page with the regex param
      router.push(`/?regex=${regex}`);
    } else {
      // Navigate back to the home page without regex if none was present
      router.push('/');
    }
  };

  // The FullscreenNfaPage itself IS the fullscreen view, so no internal fullscreen toggle is needed
  // However, we still pass the prop for NfaVisualizer to use if it needs to adjust its internal rendering
  // We also don't need to pass regex to the visualizer here, as it's purely visualization

  return (
    <div className="w-screen h-screen bg-white">
       {/* Render the NfaVisualizer component */}
      <NfaVisualizer
        nfa={nfa}
        containerRef={containerRef}
        networkRef={networkRef}
        onResetLayout={handleResetLayout}
        externalFullscreen={true}
        className="w-full h-full"
        onToggleFullscreen={handleExitFullscreen}
      />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FullscreenPageContent />
    </Suspense>
  );
} 