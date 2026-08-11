import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { verifyEmail } from "wasp/client/auth";
import { AuthLayout } from "../AuthLayout";
import { getAuthErrorMessage } from "./getAuthErrorMessage";

type VerificationState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function EmailVerificationPage() {
  const location = useLocation();
  const [state, setState] = useState<VerificationState>({ status: "loading" });

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (!token) {
      setState({
        status: "error",
        message:
          "URLにトークンが含まれていません。メール内のリンクを確認してください。",
      });
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        // Wasp resolves on success (no `{ success }` payload) and throws on failure.
        await verifyEmail({ token: token! });
        if (!cancelled) {
          setState({ status: "success" });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setState({
            status: "error",
            message: getAuthErrorMessage(err),
          });
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [location.search]);

  return (
    <AuthLayout>
      <div className="flex flex-col gap-phi-5">
        <div className="flex flex-col gap-phi-2">
          <h2 className="text-h2 font-semibold tracking-tight">メール認証</h2>
          <VerificationMessage state={state} />
        </div>

        <p className="text-caption text-muted-foreground">
          問題なければ{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            ログインへ進む
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function VerificationMessage({ state }: { state: VerificationState }) {
  switch (state.status) {
    case "loading":
      return (
        <p className="text-caption text-muted-foreground">認証を確認しています...</p>
      );
    case "success":
      return (
        <p className="text-caption text-foreground" role="status">
          メールアドレスの認証が完了しました。
        </p>
      );
    case "error":
      return (
        <p className="text-caption text-destructive" role="alert">
          {state.message}
        </p>
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
