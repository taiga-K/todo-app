import { Link } from "react-router";
import { ResetPasswordForm } from "wasp/client/auth";
import { AuthLayout } from "../AuthLayout";

export function PasswordResetPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
      <p className="mt-6 text-sm text-muted-foreground">
        問題なければ{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          ログインへ進む
        </Link>
      </p>
    </AuthLayout>
  );
}
