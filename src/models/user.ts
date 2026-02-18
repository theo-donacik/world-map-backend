import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "users" }
);

export const userModel = mongoose.model("UserModel", userSchema);

export interface User {
  username: string,
  password: string
}