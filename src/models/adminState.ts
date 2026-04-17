import mongoose from "mongoose";
import { DCChannel } from "../util/discord";

export const adminStateSchema = new mongoose.Schema(
  {
    timer: { type: Date, required: true },
    dcChannel: { type: Object, required: true },
    interestNum: { type: Number, required: true },
    alertMessage: { type: String, required: true },
    defaultWorldRegion: { type: String, required: true },
  },
  { collection: "adminState" }
);

export const adminStateModel = mongoose.model("AdminStateModel", adminStateSchema);

export interface AdminState {
  timer: Date,
  dcChannel: DCChannel,
  interestNum: number,
  alertMessage: string,
  defaultWorldRegion: string
}