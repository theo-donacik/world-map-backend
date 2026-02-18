import { Timer, timerModel } from "../models/timer";

export async function getTimer(): Promise<Date | undefined> {
  return await timerModel.findOne().then((timer) => {
    if (timer === null) {
      return;
    }
    return (timer as Timer).time;
  });
}

export async function deleteTimers() {
  await timerModel.deleteMany({});
}

export async function setTimer(time: Date): Promise<Date | undefined> {
  const newTimer = new timerModel({time: time})

  return await newTimer.save().then((timer) => {
    if (timer === null) {
      return;
    }
    return (timer as Timer).time;
  });
}