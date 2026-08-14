import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

const STORAGE_KEY = "todo-app.sidebar-width";
const DEFAULT_WIDTH_PX = 240; // 15rem
const MIN_WIDTH_PX = 176;
const MAX_WIDTH_PX = Math.round(DEFAULT_WIDTH_PX * 1.618); // ≈ φ × default

function clampWidth(width: number): number {
  return Math.min(MAX_WIDTH_PX, Math.max(MIN_WIDTH_PX, Math.round(width)));
}

function readStoredWidth(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) {
      return DEFAULT_WIDTH_PX;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_WIDTH_PX;
    }
    return clampWidth(parsed);
  } catch {
    return DEFAULT_WIDTH_PX;
  }
}

function persistWidth(next: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function useSidebarWidth() {
  const [width, setWidth] = useState(() => readStoredWidth());
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(width);
  widthRef.current = width;

  function onResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = widthRef.current;
    handle.setPointerCapture(event.pointerId);
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onPointerMove(moveEvent: PointerEvent) {
      const next = clampWidth(startWidth + (moveEvent.clientX - startX));
      widthRef.current = next;
      setWidth(next);
    }

    function onPointerUp(upEvent: PointerEvent) {
      handle.releasePointerCapture(upEvent.pointerId);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
      handle.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setIsResizing(false);
      persistWidth(widthRef.current);
    }

    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
  }

  function onResizeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 32 : 8;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? step : -step;
      const next = clampWidth(widthRef.current + delta);
      widthRef.current = next;
      setWidth(next);
      persistWidth(next);
    }
  }

  return {
    width,
    isResizing,
    minWidth: MIN_WIDTH_PX,
    maxWidth: MAX_WIDTH_PX,
    onResizePointerDown,
    onResizeKeyDown,
  };
}
