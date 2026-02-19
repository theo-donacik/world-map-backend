import { AdminState, adminStateModel } from "../models/adminState";

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