import { CreatedRegions, Region, regionModel } from "../models/region";
import { createRegions } from "../util/createRegion";
import { sendMessage } from "../util/discord";
import { getAdminState } from "./adminState";
import { getFileAsBuffer } from "./files";

export async function createAllRegionData(colorMapName: string, dataCSVName: string): Promise<CreatedRegions | undefined> {
  const colorMap = await getFileAsBuffer(colorMapName)
  const dataCSV = await getFileAsBuffer(dataCSVName)

  try {
    return (await createRegions(colorMap, dataCSV) as CreatedRegions)
  }
  catch (e){
    console.log(e)
    return
  }
}

export async function createRegion(region: Region):  Promise<string | undefined> {
  const newRegion = new regionModel(region)

  return await newRegion.save().then((region) => {
    if (region === null) {
      return;
    }
    return region._id.toString();
  });
}

export async function deleteRegion(id: string): Promise<string | undefined> {
  return await regionModel.findOneAndDelete(
    {_id: id}
  ).then((deletedRegion) => {
    if (deletedRegion === null) {
      return;
    }
    return deletedRegion._id.toString();
  });
}

export async function editRegion(id: string, region: Partial<Region>):  Promise<Region | undefined> {
  return await regionModel.findOneAndUpdate(
    {_id: id},
    {$set: region},
    {returnDocument: 'after'}
  ).then((updatedRegion) => {
    if (updatedRegion === null) {
      return;
    }
    return updatedRegion;
  });
}

export async function getRegion(regionId: string):  Promise<Region | undefined> {
  return await regionModel.findOne({_id: regionId}).then((region) => {
    if (region === null) {
      return;
    }
    return region as Region;
  });
}

export async function getSubregionsOf(parentId: string):  Promise<Region[] | undefined> {
  return await regionModel.find({parentId: parentId}).then((regions) => {
    if (createRegions === null) {
      return;
    }
    return regions as Region[];
  });
}

export async function addInterestedToken(id: string, token: string): Promise<string | undefined> {
  return await regionModel.findOneAndUpdate(
    {_id: id},
    {$push: { interestedUsers: token }},
    {returnDocument: 'after'}
  ).then((updatedRegion) => {
    if (updatedRegion === null) {
      return;
    }
    return token;
  });
}

export async function scheduleCooldown(id: string, region: Region) {
  const delay = Math.max(0, region.cooldown.getTime() - Date.now());

  setTimeout(async () => {
    editRegion(id, {interestedUsers: []}).then((editedRegion) => {

      if(editedRegion) {
        if(new Date().getTime() < new Date(editedRegion.cooldown).getTime()) {
          // Cooldown has been edited, do not trigger yet
          return
        }

        getAdminState().then((state) => {
          if(state) {
            sendMessage(state.updatesChannel.id, `${editedRegion.mission} is available again!`)
          }
        })
      }
    })
  }, delay)
}

export async function scheduleAllCooldowns() {
  const regions = await regionModel.find();

  for(var i in regions) {
    if(new Date().getTime() < new Date(regions[i].cooldown).getTime()) {
      scheduleCooldown(regions[i]._id.toString(), regions[i])
    }
  }
}