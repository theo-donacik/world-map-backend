import { Area, areaModel } from "../models/area";

export async function getAllAreas(): Promise<Area[] | undefined> {
  return await areaModel.find().then((areas) => {
    if (areas === null) {
      return;
    }
    return areas as Area[];
  });
}

export async function getArea(id: string): Promise<Area | undefined> {
  return await areaModel.findOne({_id: id}).then((area) => {
    if (area === null) {
      return;
    }
    return area as Area;
  });
}

export async function createArea(area: Area): Promise<Area | undefined> {
  const newArea = new areaModel(area)

  return await newArea.save().then((area) => {
    if (area === null) {
      return;
    }
    return area;
  });
}

export async function editArea(id: string, area: Partial<Area>): Promise<Area | undefined> {
  return await areaModel.findOneAndUpdate(
    {_id: id},
    {$set: area},
    {returnDocument: 'after'}
  ).then((updatedArea) => {
    if (updatedArea === null) {
      return;
    }
    return updatedArea;
  });
}

export async function deleteArea(id: string): Promise<Area | undefined> {
  return await areaModel.findOneAndDelete(
    {_id: id}
  ).then((deletedArea) => {
    if (deletedArea === null) {
      return;
    }
    return deletedArea;
  });
}


export async function addInterestedToken(id: string, token: string): Promise<string | undefined> {
  return await areaModel.findOneAndUpdate(
    {_id: id},
    {$push: { interestedUsers: token }},
    {returnDocument: 'after'}
  ).then((updatedArea) => {
    if (updatedArea === null) {
      return;
    }
    return token;
  });
}