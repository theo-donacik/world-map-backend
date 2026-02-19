import mongoose from "mongoose";

export const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    inviteLink: { type: String, required: true },
    interestedUsers: { type: [String], required: true },
  },
  { collection: "areas" }
);

export const areaModel = mongoose.model("AreaModel", areaSchema);

export interface Area {
  name: string,
  description: string
  inviteLink: string
  interestedUsers: string[]
}