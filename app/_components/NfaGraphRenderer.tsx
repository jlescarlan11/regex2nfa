import React, { useEffect, useRef, useCallback, useState } from "react";
import { Box } from "@radix-ui/themes";

interface NFAState {
  id: string;
  label: string;
  isStart: boolean;
  isAccept: boolean;
  x: number;
  y: number;
  isActive?: boolean;
  isVisited?: boolean;
}

interface NFATransition {
  from: string;
  to: string;
  symbol: string;
  isActive?: boolean;
}

interface NFAData {
  states: NFAState[];
  transitions: NFATransition[];
  alphabet: string[];
}

interface NFAGraphRendererProps {
  nfaData: NFAData;
  zoomLevel: number;
  onStatePositionChange?: (stateId: string, x: number, y: number) => void;
}

const NFAGraphRenderer: React.FC<NFAGraphRendererProps> = ({
  nfaData,
  zoomLevel,
  onStatePositionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    stateId: string | null;
    offset: { x: number; y: number };
  }>({
    isDragging: false,
    stateId: null,
    offset: { x: 0, y: 0 },
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const STATE_RADIUS = 30;
  const ARROW_SIZE = 8;
  const FONT_SIZE = 14;

  const drawArrow = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      isActive = false
    ) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowX = toX - Math.cos(angle) * STATE_RADIUS;
      const arrowY = toY - Math.sin(angle) * STATE_RADIUS;

      ctx.strokeStyle = isActive ? "#10b981" : "#6b7280";
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(
        fromX + Math.cos(angle) * STATE_RADIUS,
        fromY + Math.sin(angle) * STATE_RADIUS
      );
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      ctx.fillStyle = isActive ? "#10b981" : "#6b7280";
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - ARROW_SIZE * Math.cos(angle - Math.PI / 6),
        arrowY - ARROW_SIZE * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - ARROW_SIZE * Math.cos(angle + Math.PI / 6),
        arrowY - ARROW_SIZE * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    },
    []
  );

  const drawSelfLoop = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    symbol: string,
    isActive = false
  ) => {
    const loopRadius = 25;
    ctx.strokeStyle = isActive ? "#10b981" : "#6b7280";
    ctx.lineWidth = isActive ? 3 : 2;

    ctx.beginPath();
    ctx.arc(
      x,
      y - STATE_RADIUS - loopRadius,
      loopRadius,
      0.2 * Math.PI,
      0.8 * Math.PI
    );
    ctx.stroke();

    ctx.fillStyle = isActive ? "#10b981" : "#6b7280";
    const arrowAngle = Math.PI / 4;
    const arrowX = x + loopRadius * Math.cos(arrowAngle);
    const arrowY =
      y - STATE_RADIUS - loopRadius + loopRadius * Math.sin(arrowAngle);

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - ARROW_SIZE, arrowY - ARROW_SIZE / 2);
    ctx.lineTo(arrowX - ARROW_SIZE, arrowY + ARROW_SIZE / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#374151";
    ctx.font = `${FONT_SIZE}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(symbol, x, y - STATE_RADIUS - loopRadius * 2 - 5);
  };

  const drawState = (
    ctx: CanvasRenderingContext2D,
    state: NFAState,
    transform: { scale: number; offsetX: number; offsetY: number }
  ) => {
    const x = (state.x + transform.offsetX) * transform.scale;
    const y = (state.y + transform.offsetY) * transform.scale;
    const radius = STATE_RADIUS * transform.scale;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    if (state.isActive) {
      ctx.fillStyle = "#dbeafe";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3 * transform.scale;
    } else if (state.isStart) {
      ctx.fillStyle = "#e0f2fe";
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2 * transform.scale;
    } else if (state.isAccept) {
      ctx.fillStyle = "#dcfce7";
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2 * transform.scale;
    } else {
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2 * transform.scale;
    }

    ctx.fill();
    ctx.stroke();

    if (state.isAccept) {
      ctx.beginPath();
      ctx.arc(x, y, radius - 5 * transform.scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (state.isStart) {
      const arrowLength = 40 * transform.scale;
      const startX = x - radius - arrowLength;
      const startY = y;

      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2 * transform.scale;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x - radius, y);
      ctx.stroke();

      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(x - radius, y);
      ctx.lineTo(
        x - radius - ARROW_SIZE * transform.scale,
        y - (ARROW_SIZE * transform.scale) / 2
      );
      ctx.lineTo(
        x - radius - ARROW_SIZE * transform.scale,
        y + (ARROW_SIZE * transform.scale) / 2
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#1f2937";
    ctx.font = `${FONT_SIZE * transform.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.label, x, y);
  };

  const drawTransition = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      transition: NFATransition,
      states: NFAState[],
      transform: { scale: number; offsetX: number; offsetY: number }
    ) => {
      const fromState = states.find((s) => s.id === transition.from);
      const toState = states.find((s) => s.id === transition.to);
      if (!fromState || !toState) return;

      const fromX = (fromState.x + transform.offsetX) * transform.scale;
      const fromY = (fromState.y + transform.offsetY) * transform.scale;
      const toX = (toState.x + transform.offsetX) * transform.scale;
      const toY = (toState.y + transform.offsetY) * transform.scale;

      if (transition.from === transition.to) {
        drawSelfLoop(ctx, fromX, fromY, transition.symbol, transition.isActive);
        return;
      }

      drawArrow(ctx, fromX, fromY, toX, toY, transition.isActive);

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const labelOffset = 20 * transform.scale;
      const labelX = midX + Math.cos(angle + Math.PI / 2) * labelOffset;
      const labelY = midY + Math.sin(angle + Math.PI / 2) * labelOffset;

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `${FONT_SIZE * transform.scale}px Arial`;
      ctx.textAlign = "center";
      const metrics = ctx.measureText(transition.symbol);
      const padding = 4 * transform.scale;
      ctx.fillRect(
        labelX - metrics.width / 2 - padding,
        labelY - (FONT_SIZE * transform.scale) / 2 - padding,
        metrics.width + padding * 2,
        FONT_SIZE * transform.scale + padding * 2
      );

      ctx.fillStyle = transition.isActive ? "#059669" : "#374151";
      ctx.fillText(transition.symbol, labelX, labelY);
    },
    [drawArrow]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const transform = {
      scale: zoomLevel,
      offsetX: panOffset.x,
      offsetY: panOffset.y,
    };
    nfaData.transitions.forEach((transition) => {
      drawTransition(ctx, transition, nfaData.states, transform);
    });
    nfaData.states.forEach((state) => {
      drawState(ctx, state, transform);
    });
  }, [nfaData, zoomLevel, panOffset, drawTransition]);

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoomLevel - panOffset.x,
      y: (clientY - rect.top) / zoomLevel - panOffset.y,
    };
  };

  const getStateAt = (x: number, y: number): NFAState | null => {
    return (
      nfaData.states.find((state) => {
        const dx = x - state.x;
        const dy = y - state.y;
        return Math.sqrt(dx * dx + dy * dy) <= STATE_RADIUS;
      }) || null
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    const clickedState = getStateAt(coords.x, coords.y);

    if (clickedState) {
      setDragState({
        isDragging: true,
        stateId: clickedState.id,
        offset: {
          x: coords.x - clickedState.x,
          y: coords.y - clickedState.y,
        },
      });
    } else {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging && dragState.stateId !== null) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const newX = coords.x - dragState.offset.x;
      const newY = coords.y - dragState.offset.y;

      onStatePositionChange?.(dragState.stateId, newX, newY);
    } else if (isPanning) {
      const deltaX = (e.clientX - lastPanPoint.x) / zoomLevel;
      const deltaY = (e.clientY - lastPanPoint.y) / zoomLevel;

      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      stateId: null,
      offset: { x: 0, y: 0 },
    });
    setIsPanning(false);
  };

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        render();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [render]);

  return (
    <Box className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: dragState.isDragging || isPanning ? "grabbing" : "grab",
        }}
      />
    </Box>
  );
};

export default NFAGraphRenderer;
