import { Area, areaModel } from "../models/area";

export async function getAllAreas(): Promise<Area[] | undefined> {
  return await areaModel.find().then((areas) => {
    if (areas === null) {
      return;
    }
    return areas as Area[];
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

export async function editArea(id: string, area: Area): Promise<Area | undefined> {
  const foundArea = await areaModel.findById(id)

  if (foundArea === null) {
    return;
  }
  else {
    foundArea.name = area.name
    foundArea.description = area.description
    foundArea.inviteLink = area.inviteLink
    return await foundArea.save().then((area) => {
      if (area === null) {
        return;
      }
      return area;
    });    
  }
}