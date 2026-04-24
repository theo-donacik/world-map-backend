import { userMention } from "discord.js";
import { AdminState, adminStateModel } from "../models/adminState";
import { Region } from "../models/region";
import { createInterestThread, sendMessage } from "../util/discord";
import { getDCUser, getDCUserByDCId } from "./discordUser";

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

export async function initializeInterestThread(region: Region, alertMessage: string, channelId: string) {
  var mentionedUsers = ""

  console.log(region.interestedUsers)
  for(var i in region.interestedUsers) {
    const user = await getDCUser(region.interestedUsers[i])
    if(user) {
      mentionedUsers += `${userMention(user.data.id)}`
    }
  }

  console.log(mentionedUsers)

  const message = mentionedUsers + "\n" + alertMessage.replace("[name]", region.mission)

  await createInterestThread(channelId, region.mission, message)
}

export async function sendNewUserInterestMessage(threadId: string, newUser: string) {
  const user = await getDCUser(newUser)
  if(user) {
    const message = `${userMention(user.data.id)} is also interested!`
    await sendMessage(threadId, message)
  }
}

