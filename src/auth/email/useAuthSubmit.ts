import { FormEvent, useRef, useState } from "react";
import { getAuthErrorMessage } from "./getAuthErrorMessage";

type AuthSubmitOptions = {
  successMessage?: string;
  onSuccess?: () => void;
};

export function useAuthSubmit() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);

  async function run(
    action: () => Promise<void>,
    options: AuthSubmitOptions = {},
  ): Promise<boolean> {
    if (inFlightRef.current) {
      return false;
    }

    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await action();
      if (options.successMessage) {
        setSuccess(options.successMessage);
      }
      options.onSuccess?.();
      return true;
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
      return false;
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    action: () => Promise<void>,
    options?: AuthSubmitOptions,
  ) {
    event.preventDefault();
    void run(action, options);
  }

  return {
    error,
    success,
    isLoading,
    setError,
    setSuccess,
    run,
    handleSubmit,
  };
}
