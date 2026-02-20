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

export async function checkAdminToken(token: string) {
  const user = await adminUserModel.findOne({ token: token }).then((user) => {
    if (user === null) {
      return;
    }
    return user as AdminUser;
  });

  return !!user;
}