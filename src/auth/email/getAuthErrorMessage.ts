function readStringProp(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }

  const prop = (value as Record<string, unknown>)[key];
  return typeof prop === "string" ? prop : null;
}

const KNOWN_AUTH_ERROR_MESSAGES: Record<string, string> = {
  "invalid credentials": "メールアドレスまたはパスワードが正しくありません。",
};

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

export function getAuthErrorMessage(error: unknown): string {
  for (const message of collectErrorMessages(error)) {
    const translated = KNOWN_AUTH_ERROR_MESSAGES[message.toLowerCase()];
    if (translated) {
      return translated;
    }
  }

  // Do not surface raw backend/auth details to unauthenticated clients.
  return "予期しないエラーが発生しました。";
}
