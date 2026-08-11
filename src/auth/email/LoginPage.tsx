import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "wasp/client/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../shared/components/Button";
import { AuthLayout } from "../AuthLayout";
import { useAuthSubmit } from "./useAuthSubmit";

export function LoginPage() {
  const navigate = useNavigate();
  const { error, isLoading, handleSubmit } = useAuthSubmit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <div className="flex flex-col gap-phi-5">
        <div className="flex flex-col gap-phi-2">
          <h2 className="text-h2 font-semibold tracking-tight">ログイン</h2>
          <p className="text-caption text-muted-foreground">
            アカウントにサインインしてください。
          </p>
        </div>

        <form
          onSubmit={(event) =>
            handleSubmit(
              event,
              async () => {
                await login({ email, password });
              },
              { onSuccess: () => navigate("/") },
            )
          }
          className="flex flex-col gap-phi-4"
        >
          <div className="flex flex-col gap-phi-3">
            <Label htmlFor="login-email">メールアドレス</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-phi-3">
            <Label htmlFor="login-password">パスワード</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
          </div>

          {error ? (
            <p className="text-caption text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <div className="flex flex-col gap-phi-3 text-caption text-muted-foreground">
          <p>
            アカウントをお持ちでない方は{" "}
            <Link
              to="/signup"
              className="font-medium text-foreground underline underline-offset-4"
            >
              新規登録
            </Link>
          </p>
          <p>
            パスワードをお忘れの方は{" "}
            <Link
              to="/request-password-reset"
              className="font-medium text-foreground underline underline-offset-4"
            >
              再設定する
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
