import type {
  GetPasswordResetEmailContentFn,
  GetVerificationEmailContentFn,
} from "wasp/server/auth";

export const getVerificationEmailContent: GetVerificationEmailContentFn = ({
  verificationLink,
}) => ({
  subject: "【ToDo App】メールアドレスの確認",
  text: `ToDo App へようこそ。\n\n以下のリンクを開いて、メールアドレスを確認してください。\n${verificationLink}\n`,
  html: `
    <p>ToDo App へようこそ。</p>
    <p>以下のリンクを開いて、メールアドレスを確認してください。</p>
    <p><a href="${verificationLink}">メールアドレスを確認する</a></p>
  `,
});

export const getPasswordResetEmailContent: GetPasswordResetEmailContentFn = ({
  passwordResetLink,
}) => ({
  subject: "【ToDo App】パスワードの再設定",
  text: `パスワード再設定のリクエストを受け付けました。\n\n以下のリンクを開いて、新しいパスワードを設定してください。\n${passwordResetLink}\n\n心当たりがない場合は、このメールを無視してください。\n`,
  html: `
    <p>パスワード再設定のリクエストを受け付けました。</p>
    <p>以下のリンクを開いて、新しいパスワードを設定してください。</p>
    <p><a href="${passwordResetLink}">パスワードを再設定する</a></p>
    <p>心当たりがない場合は、このメールを無視してください。</p>
  `,
});
