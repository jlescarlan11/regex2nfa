// components/NfaVisualizationCard.tsx
"use client";
import type { State } from "../_types/nfa";
import { COLOR_SCHEME } from "../_utils/visualization";

export const getNodeStyle = (
  state: State,
  isStart: boolean,
  isAccept: boolean
) => {
  if (isStart) {
    return {
      color: {
        background: COLOR_SCHEME.start.background,
        border: COLOR_SCHEME.start.border,
        highlight: {
          background: COLOR_SCHEME.start.highlight,
          border: COLOR_SCHEME.start.border,
        },
      },
    };
  } else if (isAccept) {
    return {
      color: {
        background: COLOR_SCHEME.accept.background,
        border: COLOR_SCHEME.accept.border,
        highlight: {
          background: COLOR_SCHEME.accept.highlight,
          border: COLOR_SCHEME.accept.border,
        },
      },
      shapeProperties: {
        borderDashes: false,
      },
      borderWidth: 5, // Thicker border for accept states
    };
  } else {
    return {
      color: {
        background: COLOR_SCHEME.intermediate.background,
        border: COLOR_SCHEME.intermediate.border,
        highlight: {
          background: COLOR_SCHEME.intermediate.highlight,
          border: COLOR_SCHEME.intermediate.border,
        },
      },
    };
  }
};
