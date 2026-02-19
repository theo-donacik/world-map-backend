import { adminUserModel } from "../models/adminUser";
import { AdminUser } from "../models/adminUser";

export async function getUser(username: string): Promise<AdminUser | undefined> {
  return await adminUserModel.findOne({ username: username }).then((user) => {
    if (user === null) {
      return;
    }
    return user as AdminUser;
  });
}

export async function isCorrectPassword(
  username: string,
  password: string
): Promise<boolean> {
  const user = await getUser(username);
  return !!user && user.password === password;
}