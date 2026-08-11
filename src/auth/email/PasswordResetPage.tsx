import { useState } from "react";
import { Link, useLocation } from "react-router";
import { resetPassword } from "wasp/client/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../shared/components/Button";
import { AuthLayout } from "../AuthLayout";
import { useAuthSubmit } from "./useAuthSubmit";

export function PasswordResetPage() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");
  const { error, success, isLoading, setError, setSuccess, run } =
    useAuthSubmit();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  function showValidationError(message: string) {
    setSuccess(null);
    setError(message);
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-phi-5">
        <div className="flex flex-col gap-phi-2">
          <h2 className="text-h2 font-semibold tracking-tight">
            パスワードを再設定
          </h2>
          <p className="text-caption text-muted-foreground">
            新しいパスワードを入力してください。
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (!token) {
              showValidationError(
                "URLにトークンが含まれていません。メール内のリンクを確認してください。",
              );
              return;
            }

            if (password !== passwordConfirmation) {
              showValidationError("パスワードが一致しません。");
              return;
            }

            void run(
              async () => {
                await resetPassword({ password, token });
              },
              {
                successMessage: "パスワードを再設定しました。",
                onSuccess: () => {
                  setPassword("");
                  setPasswordConfirmation("");
                },
              },
            );
          }}
          className="flex flex-col gap-phi-4"
        >
          <div className="flex flex-col gap-phi-3">
            <Label htmlFor="reset-password">新しいパスワード</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-phi-3">
            <Label htmlFor="reset-password-confirm">
              新しいパスワード（確認）
            </Label>
            <Input
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              disabled={isLoading}
            />
          </div>

          {error ? (
            <p className="text-caption text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-caption text-foreground" role="status">
              {success}
            </p>
          ) : null}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "再設定中..." : "パスワードを再設定"}
          </Button>
        </form>

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
