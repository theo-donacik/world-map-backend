import mongoose from "mongoose";

export const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true }
  },
  { collection: "adminUser" }
);

export const adminUserModel = mongoose.model("AdminUserModel", adminUserSchema);

export interface AdminUser {
  username: string,
  password: string,
  token: string
}