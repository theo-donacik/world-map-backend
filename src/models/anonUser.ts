import mongoose from "mongoose";

export const anonUserSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
  },
  { collection: "anonUsers" }
);

export const anonUserModel = mongoose.model("AnonUserModel", anonUserSchema);

export interface AnonUser {
  token: string
}