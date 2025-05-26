// hooks/useResizableVisualization.ts
import { useState, useCallback, useEffect, useRef } from "react";

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface UseResizableVisualizationOptions {
  initialSize?: Size;
  minSize?: Size;
  maxSize?: Size;
  onResize?: (size: Size) => void;
}

interface ResizableState {
  size: Size;
  position: Position;
  isDragging: boolean;
  isResizing: boolean;
  isFullscreen: boolean;
}

export const useResizableVisualization = ({
  initialSize = { width: 800, height: 600 },
  minSize = { width: 400, height: 300 },
  maxSize = { width: 1400, height: 1000 },
  onResize,
}: UseResizableVisualizationOptions = {}) => {
  const [state, setState] = useState<ResizableState>({
    size: initialSize,
    position: { x: 0, y: 0 },
    isDragging: false,
    isResizing: false,
    isFullscreen: false,
  });

  const dragStartRef = useRef<{
    x: number;
    y: number;
    startPos: Position;
  } | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    startSize: Size;
  } | null>(null);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startSize: state.size,
      };

      setState((prev) => ({ ...prev, isResizing: true }));
    },
    [state.size]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.min(
        Math.max(
          resizeStartRef.current.startSize.width + deltaX,
          minSize.width
        ),
        maxSize.width
      );
      const newHeight = Math.min(
        Math.max(
          resizeStartRef.current.startSize.height + deltaY,
          minSize.height
        ),
        maxSize.height
      );

      const newSize = { width: newWidth, height: newHeight };

      setState((prev) => {
        if (
          prev.size.width !== newSize.width ||
          prev.size.height !== newSize.height
        ) {
          onResize?.(newSize);
          return { ...prev, size: newSize };
        }
        return prev;
      });
    },
    [minSize, maxSize, onResize]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    resizeStartRef.current = null;
    setState((prev) => ({ ...prev, isResizing: false }));
  }, []);

  // Handle drag start for moving the entire visualization
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPos: state.position,
      };

      setState((prev) => ({ ...prev, isDragging: true }));
    },
    [state.position]
  );

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newPosition = {
      x: dragStartRef.current.startPos.x + deltaX,
      y: dragStartRef.current.startPos.y + deltaY,
    };

    setState((prev) => ({ ...prev, position: newPosition }));
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    dragStartRef.current = null;
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Reset to initial size and position
  const resetLayout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      size: initialSize,
      position: { x: 0, y: 0 },
      isFullscreen: false,
    }));
    onResize?.(initialSize);
  }, [initialSize, onResize]);

  // Auto-resize to fit content
  const autoResize = useCallback(
    (contentBounds?: { width: number; height: number }) => {
      if (!contentBounds) return;

      const padding = 100; // Extra space around content
      const newSize = {
        width: Math.min(
          Math.max(contentBounds.width + padding, minSize.width),
          maxSize.width
        ),
        height: Math.min(
          Math.max(contentBounds.height + padding, minSize.height),
          maxSize.height
        ),
      };

      setState((prev) => {
        if (
          prev.size.width !== newSize.width ||
          prev.size.height !== newSize.height
        ) {
          onResize?.(newSize);
          return { ...prev, size: newSize };
        }
        return prev;
      });
    },
    [minSize, maxSize, onResize]
  );

  // Mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (state.isResizing) {
        handleResizeMove(e);
      } else if (state.isDragging) {
        handleDragMove(e);
      }
    };

    const handleMouseUp = () => {
      if (state.isResizing) {
        handleResizeEnd();
      } else if (state.isDragging) {
        handleDragEnd();
      }
    };

    if (state.isResizing || state.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = state.isResizing ? "se-resize" : "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [
    state.isResizing,
    state.isDragging,
    handleResizeMove,
    handleDragMove,
    handleResizeEnd,
    handleDragEnd,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.isFullscreen) {
        toggleFullscreen();
      }

      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        toggleFullscreen();
      }

      if (e.key === "r" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        resetLayout();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.isFullscreen, toggleFullscreen, resetLayout]);

  return {
    size: state.size,
    position: state.position,
    isDragging: state.isDragging,
    isResizing: state.isResizing,
    isFullscreen: state.isFullscreen,
    handleResizeStart,
    handleDragStart,
    toggleFullscreen,
    resetLayout,
    autoResize,
    containerStyle: state.isFullscreen
      ? {
          position: "fixed" as const,
          top: "2rem",
          left: "2rem",
          right: "2rem",
          bottom: "2rem",
          zIndex: 50,
          transform: "none",
        }
      : {
          width: `${state.size.width}px`,
          height: `${state.size.height}px`,
          transform: `translate(${state.position.x}px, ${state.position.y}px)`,
        },
    containerClasses: `
      transition-all duration-300 ease-in-out
      ${state.isFullscreen ? "shadow-2xl" : "shadow-lg"}
      ${state.isDragging ? "cursor-grabbing" : ""}
      ${state.isResizing ? "cursor-se-resize" : ""}
    `.trim(),
  };
};
