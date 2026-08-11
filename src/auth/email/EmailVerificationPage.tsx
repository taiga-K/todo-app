import { Link } from "react-router";
import { VerifyEmailForm } from "wasp/client/auth";
import { AuthLayout } from "../AuthLayout";

export function EmailVerificationPage() {
  return (
    <AuthLayout>
      <VerifyEmailForm />
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
