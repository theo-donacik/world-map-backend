import { AdminState, adminStateModel } from "../models/adminState";
import { sendMessage } from "../util/discord";
import { getArea } from "./area";

export async function getAdminState(): Promise<AdminState | undefined> {
  return await adminStateModel.findOne().then((state) => {
    if (state === null) {
      return;
    }
    return state;
  });
}

export async function setState(state: Partial<AdminState>): Promise<AdminState | undefined> {
  return await adminStateModel.findOneAndUpdate(
    {},
    {$set: state},
    {returnDocument: 'after'}
  ).then((newState) => {
    if (newState === null) {
      return;
    }
    return newState;
  });
}

export async function sendThresholdMessage(areaId: string) {
  const state = await getAdminState()
  const area = await getArea(areaId)

  if(state && area) {
    if(area.interestedUsers.length >= state.interestNum) {
      const message = state.alertMessage.replace("[name]", area.name).replace("[link]", area.inviteLink)
      sendMessage(state.dcChannel.id, message)
    }
  }
}