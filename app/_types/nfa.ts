// types/nfa.ts
// Interface for NFA states
export interface State {
  id: number;
  isAccept: boolean;
}

// Interface for NFA transitions
export interface Transition {
  from: State;
  to: State;
  symbol: string | undefined; // Changed from string | null to align with vis-network Edge label type
}
