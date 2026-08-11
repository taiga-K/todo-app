function readStringProp(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return null;
  }

  const prop = (value as Record<string, unknown>)[key];
  return typeof prop === "string" ? prop : null;
}

export function getAuthErrorMessage(error: unknown): string {
  const message = readStringProp(error, "message");
  if (!message) {
    return "予期しないエラーが発生しました。";
  }

  const data = typeof error === "object" && error !== null && "data" in error
    ? (error as { data: unknown }).data
    : null;
  const nestedData =
    typeof data === "object" && data !== null && "data" in data
      ? (data as { data: unknown }).data
      : null;
  const description = readStringProp(nestedData, "message");

  return description ? `${message}: ${description}` : message;
}
