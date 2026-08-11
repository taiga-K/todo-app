import { defineUserSignupFields } from "wasp/server/auth";
import { validateUsername } from "../usernameRules";

export const userSignupFields = defineUserSignupFields({
  username: (data) => validateUsername(data.username),
});
