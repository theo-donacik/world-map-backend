import mongoose from "mongoose";

export const discordUserSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    data: { type: Object, required: true },
    admin: { type: Boolean, required: true },
  },
  { collection: "discordUser" }
);

export const discordUserModel = mongoose.model("DiscordUserModel", discordUserSchema);

export interface DiscordUser {
  token: string,
  data: DiscordUserData,
  admin: boolean
}

export interface DiscordSession {
  token_type: string,
  access_token: string,
  expires_in: number,
  refresh_token: string,
  scope: string
}

export interface DiscordUserData {
  id: string,
  username: string,
  global_name: string,
}