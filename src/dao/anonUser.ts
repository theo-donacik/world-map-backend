import { AnonUser, anonUserModel } from "../models/anonUser";
import { v4 as uuidv4 } from 'uuid';

export async function createUser(): Promise<AnonUser | undefined> {
  const token = uuidv4();
  const newAnon = new anonUserModel({token: token})
  
  return await newAnon.save().then((anon) => {
    if (newAnon === null) {
      return;
    }
    return anon;
  });
}

export async function checkToken(token: string): Promise<boolean> {
  return await anonUserModel.findOne({token: token}).then((user) => {
    if (user === null) {
      return false;
    }
    return true;
  })
}