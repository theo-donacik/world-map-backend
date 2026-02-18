import mongoose from "mongoose";

export const timerSchema = new mongoose.Schema(
  {
    time: { type: Date, required: true }
  },
  { collection: "timer" }
);

export const timerModel = mongoose.model("TimerModel", timerSchema);

export interface Timer {
  time: Date
}