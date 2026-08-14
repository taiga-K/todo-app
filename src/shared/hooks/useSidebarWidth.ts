import {
  useEffect,
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
  const activeResizeCleanupRef = useRef<
    ((shouldUpdateState: boolean) => void) | null
  >(null);
  widthRef.current = width;

  useEffect(
    () => () => {
      activeResizeCleanupRef.current?.(false);
    },
    [],
  );

  function onResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    activeResizeCleanupRef.current?.(true);

    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = widthRef.current;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    handle.setPointerCapture(pointerId);
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function onPointerMove(moveEvent: PointerEvent) {
      const next = clampWidth(startWidth + (moveEvent.clientX - startX));
      widthRef.current = next;
      setWidth(next);
    }

    let isCleanedUp = false;
    function cleanupResize(shouldUpdateState: boolean) {
      if (isCleanedUp) {
        return;
      }
      isCleanedUp = true;

      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerEnd);
      handle.removeEventListener("pointercancel", onPointerEnd);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;

      try {
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      } catch {
        // Capture may already be gone after pointercancel; cleanup must continue.
      }

      if (activeResizeCleanupRef.current === cleanupResize) {
        activeResizeCleanupRef.current = null;
      }
      if (shouldUpdateState) {
        setIsResizing(false);
      }
      persistWidth(widthRef.current);
    }

    function onPointerEnd() {
      cleanupResize(true);
    }

    activeResizeCleanupRef.current = cleanupResize;
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerEnd);
    handle.addEventListener("pointercancel", onPointerEnd);
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
