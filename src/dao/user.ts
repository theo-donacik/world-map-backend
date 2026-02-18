import { userModel } from "../models/user";
import { User } from "../models/user";

export async function getUser(username: string): Promise<User | undefined> {
  return await userModel.findOne({ username: username }).then((user) => {
    if (user === null) {
      return;
    }
    return user as User;
  });
}

export async function isCorrectPassword(
  username: string,
  password: string
): Promise<boolean> {
  const user = await getUser(username);
  return !!user && user.password === password;
}