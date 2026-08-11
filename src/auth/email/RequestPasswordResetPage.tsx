import { useState } from "react";
import { Link } from "react-router";
import { requestPasswordReset } from "wasp/client/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../shared/components/Button";
import { AuthLayout } from "../AuthLayout";
import { useAuthSubmit } from "./useAuthSubmit";

export function RequestPasswordResetPage() {
  const { error, success, isLoading, handleSubmit } = useAuthSubmit();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout>
      <div className="flex flex-col gap-phi-5">
        <div className="flex flex-col gap-phi-2">
          <h2 className="text-h2 font-semibold tracking-tight">
            パスワードを忘れた場合
          </h2>
          <p className="text-caption text-muted-foreground">
            登録済みのメールアドレスを入力すると、再設定用のリンクを送ります。
          </p>
        </div>

        <form
          onSubmit={(event) =>
            handleSubmit(
              event,
              async () => {
                await requestPasswordReset({ email });
              },
              {
                successMessage:
                  "パスワード再設定用のリンクをメールで送信しました。受信トレイをご確認ください。",
                onSuccess: () => setEmail(""),
              },
            )
          }
          className="flex flex-col gap-phi-4"
        >
          <div className="flex flex-col gap-phi-3">
            <Label htmlFor="reset-request-email">メールアドレス</Label>
            <Input
              id="reset-request-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
            {isLoading ? "送信中..." : "再設定メールを送る"}
          </Button>
        </form>

        <p className="text-caption text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            ログインに戻る
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
