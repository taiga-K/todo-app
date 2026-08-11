import { Link } from "react-router";
import { LoginForm } from "wasp/client/auth";
import { AuthLayout } from "../AuthLayout";

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
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
    </AuthLayout>
  );
}
