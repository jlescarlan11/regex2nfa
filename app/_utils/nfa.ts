// utils/nfa.ts
import type { State, Transition } from "@/app/_types/nfa";

// Builds an NFA from a postfix regular expression using Thompson's construction algorithm.
export const buildNFAFromPostfix = (postfix: string) => {
  let stateCounter = 1; // Start from 1 to reserve 0 for start state
  const stack: Array<{ start: State; end: State; transitions: Transition[] }> =
    [];

  const createState = (isAccept = false): State => ({
    id: stateCounter++,
    isAccept,
  });

  const addTransition = (
    from: State,
    to: State,
    symbol: string | undefined
  ): Transition => ({
    from,
    to,
    symbol,
  });

  if (postfix.length === 0) {
    const start = { id: 0, isAccept: true }; // Use ID 0 for start state
    return { start, end: start, transitions: [] };
  }

  for (const char of postfix) {
    switch (char) {
      case "·": {
        if (stack.length < 2)
          throw new Error(
            "Invalid postfix: Not enough operands for '·' (concatenation)."
          );
        const frag2 = stack.pop()!;
        const frag1 = stack.pop()!;
        frag1.end.isAccept = false;
        frag2.start.isAccept = false; // Ensure intermediate start is not accept
        const transitions = [
          ...frag1.transitions,
          ...frag2.transitions,
          addTransition(frag1.end, frag2.start, undefined),
        ];
        stack.push({ start: frag1.start, end: frag2.end, transitions });
        break;
      }
      case "|": {
        if (stack.length < 2)
          throw new Error(
            "Invalid postfix: Not enough operands for '|' (alternation)."
          );
        const fragB = stack.pop()!;
        const fragA = stack.pop()!;
        const start = createState();
        const end = createState(true); // End state of alternation is accept

        fragA.end.isAccept = false;
        fragB.end.isAccept = false;
        fragA.start.isAccept = false; // Ensure intermediate start is not accept
        fragB.start.isAccept = false; // Ensure intermediate start is not accept

        const transitions = [
          ...fragA.transitions,
          ...fragB.transitions,
          addTransition(start, fragA.start, undefined),
          addTransition(start, fragB.start, undefined),
          addTransition(fragA.end, end, undefined),
          addTransition(fragB.end, end, undefined),
        ];
        stack.push({ start, end, transitions });
        break;
      }
      case "*": {
        if (stack.length < 1)
          throw new Error(
            "Invalid postfix: Not enough operands for '*' (Kleene star)."
          );
        const frag = stack.pop()!;
        const start = createState();
        const end = createState(true); // End state of star is accept

        frag.end.isAccept = false;
        frag.start.isAccept = false; // Ensure intermediate start is not accept

        const transitions = [
          ...frag.transitions,
          addTransition(start, frag.start, undefined),
          addTransition(frag.end, end, undefined),
          addTransition(frag.end, frag.start, undefined),
          addTransition(start, end, undefined),
        ];
        stack.push({ start, end, transitions });
        break;
      }
      case "+": {
        if (stack.length < 1)
          throw new Error(
            "Invalid postfix: Not enough operands for '+' (Kleene plus)."
          );
        const frag = stack.pop()!;
        const start = createState();
        const end = createState(true); // End state of plus is accept

        frag.end.isAccept = false;
        frag.start.isAccept = false; // Ensure intermediate start is not accept

        const transitions = [
          ...frag.transitions,
          addTransition(start, frag.start, undefined),
          addTransition(frag.end, end, undefined),
          addTransition(frag.end, frag.start, undefined),
        ];
        stack.push({ start, end, transitions });
        break;
      }
      case "?": {
        if (stack.length < 1)
          throw new Error(
            "Invalid postfix: Not enough operands for '?' (zero or one)."
          );
        const frag = stack.pop()!;
        const start = createState();
        const end = createState(true); // End state of optional is accept

        frag.end.isAccept = false;
        frag.start.isAccept = false; // Ensure intermediate start is not accept

        const transitions = [
          ...frag.transitions,
          addTransition(start, frag.start, undefined),
          addTransition(frag.end, end, undefined),
          addTransition(start, end, undefined),
        ];
        stack.push({ start, end, transitions });
        break;
      }
      case "ε":
      default: {
        const start = createState();
        const end = createState(true); // End state of literal/epsilon is accept
        const symbol = char === "ε" ? undefined : char;
        stack.push({
          start,
          end,
          transitions: [addTransition(start, end, symbol)],
        });
        break;
      }
    }
  }

  if (stack.length !== 1)
    throw new Error(
      "Invalid postfix expression or construction error: Stack should contain exactly one NFA fragment at the end."
    );
  const finalNFA = stack.pop()!;
  finalNFA.start.isAccept = false;
  finalNFA.end.isAccept = true; // Explicitly ensure the final NFA's end state is accept.

  // Ensure the start state has ID 0
  if (finalNFA.start.id !== 0) {
    // Find the state with ID 0 if it exists
    const state0 = finalNFA.transitions.find(t => t.from.id === 0 || t.to.id === 0);
    if (state0) {
      // Swap IDs between start state and state 0
      const oldStartId = finalNFA.start.id;
      finalNFA.start.id = 0;
      if (state0.from.id === 0) {
        state0.from.id = oldStartId;
      } else {
        state0.to.id = oldStartId;
      }
    } else {
      // If no state 0 exists, just change the start state's ID
      finalNFA.start.id = 0;
    }
  }

  return finalNFA;
};

export const computeEpsilonClosure = (
  states: Set<State>,
  transitions: Transition[]
): Set<State> => {
  const closure = new Set<State>();
  const stack: State[] = [];

  states.forEach((s) => {
    closure.add(s);
    stack.push(s);
  });

  while (stack.length > 0) {
    const current = stack.pop()!;
    transitions
      .filter((t) => t.from.id === current.id && t.symbol === undefined)
      .forEach((t) => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }
  return closure;
};

export const processCharacterStep = (
  activeStates: Set<State>,
  char: string,
  allTransitions: Transition[]
): Set<State> => {
  const directNextStates = new Set<State>();
  activeStates.forEach((s) => {
    allTransitions
      .filter((t) => t.from.id === s.id && t.symbol === char)
      .forEach((t) => {
        directNextStates.add(t.to);
      });
  });
  return computeEpsilonClosure(directNextStates, allTransitions);
};
