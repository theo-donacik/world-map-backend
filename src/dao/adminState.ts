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

export async function scheduleWorldTimerAlerts() {
  const state = await getAdminState()
  const twoWeeks = 1209600000;
  const oneWeek = 604800000;
  const threeDays = 259200000;
  const oneDay = 86400000;

  const createTimeout = (timeout: number, stateWhenStarted: AdminState, message: string) => {
    const delay = Math.max(0, stateWhenStarted.timer.getTime() - (Date.now() + timeout));

    if(delay <= 0) {
      return
    }
    
    setTimeout(async () => {
      getAdminState().then((currentState) => {
        if(currentState && currentState.timer.getTime() === stateWhenStarted.timer.getTime()) {
          const timeUntil = Math.max(0, currentState.timer.getTime() - Date.now());
          if(timeUntil <= timeout) {
            sendMessage(currentState.updatesChannel.id, message) 
          }
        }
      })
    }, delay)
  }

  if(state) {
    createTimeout(0, state, "The timer is over")
    createTimeout(oneDay, state, "24 Hours Remain")
    createTimeout(threeDays, state, "3 Days Remain")
    createTimeout(oneWeek, state, "1 Week Remains")
    createTimeout(twoWeeks, state, "2 Weeks Remian")
  }
}

