export const USERNAME_MIN_LENGTH = 6;

export const USERNAME_REQUIRED_MESSAGE = "ユーザー名は必須です。";
export const USERNAME_TOO_SHORT_MESSAGE =
  "ユーザー名は6文字以上で入力してください。";

export function validateUsername(username: unknown): string {
  if (typeof username !== "string" || username.trim().length === 0) {
    throw new Error(USERNAME_REQUIRED_MESSAGE);
  }

  const trimmed = username.trim();
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    throw new Error(USERNAME_TOO_SHORT_MESSAGE);
  }

  return trimmed;
}
