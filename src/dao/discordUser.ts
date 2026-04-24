import { v4 as uuidv4 } from 'uuid';
import { DiscordUser, discordUserModel } from "../models/discordUser";
import { User } from 'discord.js';

export async function createDCUser(userData: User): Promise<DiscordUser | undefined> {
  const matchingUser = await getDCUserByDCId(userData.id)

  if(matchingUser) {
    return matchingUser;
  }
  
  const token = uuidv4();
  const newUser = new discordUserModel({token: token, admin: false, data: userData})
  
  return await newUser.save().then((user) => {
    if (user === null) {
      return;
    }
    return user;
  });
}

export async function getDCUserByDCId(dc_id: string): Promise<DiscordUser | undefined> {
  return await discordUserModel.findOne({"data.id": dc_id}).then((user) => {
    if (user === null) {
      return;
    }
    return user as DiscordUser;
  });
}

export async function getDCUser(token: string): Promise<DiscordUser | undefined> {
  return await discordUserModel.findOne({token: token}).then((user) => {
    if (user === null) {
      return;
    }
    return user as DiscordUser;
  });
}


export async function checkUserToken(token: string) {
  const user = await getDCUser(token)

  return !!user;
}

export async function checkAdminToken(token: string): Promise<boolean> {
  return await discordUserModel.findOne({ token: token }).then((user) => {
    if (user === null) {
      return false;
    }
    return user.admin
  });
}