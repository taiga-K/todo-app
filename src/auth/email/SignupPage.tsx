import { Link } from "react-router";
import { SignupForm } from "wasp/client/auth";
import { AuthLayout } from "../AuthLayout";

export function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm
        additionalFields={[
          {
            name: "username",
            type: "input",
            label: "ユーザー名",
            validations: {
              required: "ユーザー名は必須です。",
              minLength: {
                value: 6,
                message: "ユーザー名は6文字以上で入力してください。",
              },
            },
          },
        ]}
      />
      <p className="mt-6 text-sm text-muted-foreground">
        すでにアカウントをお持ちの方は{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          ログイン
        </Link>
      </p>
    </AuthLayout>
  );
}
