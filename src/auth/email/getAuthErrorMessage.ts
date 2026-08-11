function readStringProp(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }

  const prop = (value as Record<string, unknown>)[key];
  return typeof prop === "string" ? prop : null;
}

// Null-prototype map so lookups never return inherited Object properties.
const KNOWN_AUTH_ERROR_MESSAGES: Record<string, string> = Object.assign(
  Object.create(null),
  {
    "invalid credentials":
      "メールアドレスまたはパスワードが正しくありません。",
    // Intentionally omit "user with the same identity already exists":
    // a distinct client message would enable account enumeration. Wasp already
    // returns success for verified existing emails on signup.
    "email must be present": "メールアドレスを入力してください。",
    "email must be a valid email": "有効なメールアドレスを入力してください。",
    "password must be present": "パスワードを入力してください。",
    "password must be at least 8 characters":
      "パスワードは8文字以上で入力してください。",
    "password must contain a number":
      "パスワードには数字を1文字以上含めてください。",
    "token must be present":
      "トークンが見つかりません。メール内のリンクを確認してください。",
    "email verification failed, invalid token":
      "メール認証に失敗しました。リンクが無効か期限切れの可能性があります。",
    "password reset failed, invalid token":
      "パスワード再設定に失敗しました。リンクが無効か期限切れの可能性があります。",
    "failed to send email verification email.":
      "確認メールの送信に失敗しました。しばらくしてから再度お試しください。",
    "failed to send password reset email.":
      "パスワード再設定メールの送信に失敗しました。しばらくしてから再度お試しください。",
  },
);

const RATE_LIMIT_MESSAGE =
  /^please wait (\d+) secs before trying again\.?$/i;

function collectErrorMessages(error: unknown): string[] {
  const messages: string[] = [];
  const topLevel = readStringProp(error, "message");
  if (topLevel) {
    messages.push(topLevel);
  }

  const data =
    typeof error === "object" && error !== null && "data" in error
      ? (error as { data: unknown }).data
      : null;

  // WaspHttpError.data is the API JSON body: { message, data }.
  const bodyMessage = readStringProp(data, "message");
  if (bodyMessage) {
    messages.push(bodyMessage);
  }

  const nestedData =
    typeof data === "object" && data !== null && "data" in data
      ? (data as { data: unknown }).data
      : null;
  const nested = readStringProp(nestedData, "message");
  if (nested) {
    messages.push(nested);
  }

  return messages;
}

function translateAuthMessage(message: string): string | null {
  const known = KNOWN_AUTH_ERROR_MESSAGES[message.toLowerCase()];
  if (typeof known === "string") {
    return known;
  }

  const rateLimit = message.match(RATE_LIMIT_MESSAGE);
  if (rateLimit) {
    return `短時間にリクエストが集中しています。${rateLimit[1]}秒後に再度お試しください。`;
  }

  return null;
}

export function getAuthErrorMessage(error: unknown): string {
  for (const message of collectErrorMessages(error)) {
    const translated = translateAuthMessage(message);
    if (translated) {
      return translated;
    }
  }

  // Do not surface raw backend/auth details to unauthenticated clients.
  return "予期しないエラーが発生しました。";
}
