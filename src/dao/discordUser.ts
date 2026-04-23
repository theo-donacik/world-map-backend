import { v4 as uuidv4 } from 'uuid';
import { DiscordUser, DiscordUserData, discordUserModel } from "../models/discordUser";

export async function createDCUser(userData: DiscordUserData): Promise<DiscordUser | undefined> {
  const matchingUser = await getDCUser(userData.id)

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

export async function getDCUser(dc_id: string): Promise<DiscordUser | undefined> {
  return await discordUserModel.findOne({"data.id": dc_id}).then((user) => {
    if (user === null) {
      return;
    }
    return user as DiscordUser;
  });
}


export async function checkUserToken(token: string) {
  const user = await discordUserModel.findOne({ token: token }).then((user) => {
    if (user === null) {
      return;
    }
    return user as DiscordUser;
  });

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