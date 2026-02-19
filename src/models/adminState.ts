import mongoose from "mongoose";
import { DCChannel } from "../util/discord";

export const adminStateSchema = new mongoose.Schema(
  {
    timer: { type: Date, required: true },
    dcChannel: { type: Object, required: true }
  },
  { collection: "adminState" }
);

export const adminStateModel = mongoose.model("AdminStateModel", adminStateSchema);

export interface AdminState {
  timer: Date,
  dcChannel: DCChannel
}