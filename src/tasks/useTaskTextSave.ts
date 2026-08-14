import { useEffect, useRef, useState } from "react";
import { updateTask } from "wasp/client/operations";

interface UseTaskTextSaveOptions {
  taskId: string;
  serverValue: string;
  normalize: (value: string) => string;
  allowEmpty: boolean;
  errorMessage: string;
  /** Field persisted via updateTask — description only for now. */
  field: "description";
}

/**
 * Draft + serialized save for the task title field.
 * Compares against the server value; reverts the draft on failure.
 */
export function useTaskTextSave({
  taskId,
  serverValue,
  normalize,
  allowEmpty,
  errorMessage,
  field,
}: UseTaskTextSaveOptions) {
  const [draft, setDraft] = useState(serverValue);
  const draftRef = useRef(draft);
  const serverValueRef = useRef(serverValue);
  const normalizeRef = useRef(normalize);
  const taskIdRef = useRef(taskId);
  const generationRef = useRef(0);
  const saveChainRef = useRef(Promise.resolve());

  draftRef.current = draft;
  serverValueRef.current = serverValue;
  normalizeRef.current = normalize;

  useEffect(() => {
    taskIdRef.current = taskId;
    // Invalidate in-flight handlers from the previous task.
    generationRef.current += 1;
    saveChainRef.current = Promise.resolve();
    setDraft(serverValueRef.current);
  }, [taskId]);

  useEffect(() => {
    if (
      normalizeRef.current(draftRef.current) ===
      normalizeRef.current(serverValue)
    ) {
      setDraft(serverValue);
    }
  }, [serverValue]);

  async function save(): Promise<void> {
    const normalizeValue = normalizeRef.current;
    const next = normalizeValue(draftRef.current);
    const currentServer = normalizeValue(serverValueRef.current);
    const id = taskIdRef.current;

    if (!allowEmpty && !next) {
      setDraft(serverValueRef.current);
      return;
    }
    if (next === currentServer) {
      setDraft(serverValueRef.current);
      return;
    }

    const generation = ++generationRef.current;
    setDraft(next);
    saveChainRef.current = saveChainRef.current.then(async () => {
      if (generation !== generationRef.current) {
        return;
      }
      try {
        if (field === "description") {
          await updateTask({ id, description: next });
        }
      } catch (err: unknown) {
        if (generation !== generationRef.current) {
          return;
        }
        setDraft(serverValueRef.current);
        window.alert(`${errorMessage}: ${String(err)}`);
      }
    });
    await saveChainRef.current;
  }

  return { draft, setDraft, save };
}
