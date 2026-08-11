import { FormEvent, useState } from "react";
import { getAuthErrorMessage } from "./getAuthErrorMessage";

type AuthSubmitOptions = {
  successMessage?: string;
  onSuccess?: () => void;
};

export function useAuthSubmit() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function run(
    action: () => Promise<void>,
    options: AuthSubmitOptions = {},
  ): Promise<boolean> {
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
