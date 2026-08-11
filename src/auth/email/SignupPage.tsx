import { useState } from "react";
import { Link } from "react-router";
import { signup } from "wasp/client/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../shared/components/Button";
import { AuthLayout } from "../AuthLayout";
import {
  USERNAME_MIN_LENGTH,
  USERNAME_TOO_SHORT_MESSAGE,
  validateUsername,
} from "../usernameRules";
import { useAuthSubmit } from "./useAuthSubmit";

export function SignupPage() {
  const { error, success, isLoading, setError, setSuccess, run } =
    useAuthSubmit();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">新規登録</h2>
          <p className="text-sm text-muted-foreground">
            アカウントを作成して、タスク管理を始めましょう。
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSuccess(null);

            let normalizedUsername: string;
            try {
              normalizedUsername = validateUsername(username);
            } catch (err: unknown) {
              setError(
                err instanceof Error ? err.message : USERNAME_TOO_SHORT_MESSAGE,
              );
              return;
            }

            void run(
              async () => {
                await signup({
                  email,
                  password,
                  username: normalizedUsername,
                });
              },
              {
                successMessage:
                  "登録が完了しました。確認メールのリンクからメールアドレスを認証してください。",
                onSuccess: () => {
                  setUsername("");
                  setEmail("");
                  setPassword("");
                },
              },
            );
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-username">ユーザー名</Label>
            <Input
              id="signup-username"
              type="text"
              autoComplete="username"
              required
              minLength={USERNAME_MIN_LENGTH}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-email">メールアドレス</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-password">パスワード</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-foreground" role="status">
              {success}
            </p>
          ) : null}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "登録中..." : "登録する"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            ログイン
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
