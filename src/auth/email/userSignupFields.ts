import { defineUserSignupFields } from "wasp/server/auth";

export const userSignupFields = defineUserSignupFields({
  username: (data) => {
    if (typeof data.username !== "string") {
      throw new Error("ユーザー名は必須です。");
    }
    if (data.username.length < 6) {
      throw new Error("ユーザー名は6文字以上で入力してください。");
    }
    return data.username;
  },
});
