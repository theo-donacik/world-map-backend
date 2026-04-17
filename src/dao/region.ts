import { CreatedRegions, Region, regionModel } from "../models/region";
import { createRegions } from "../util/createRegion";
import { getFileAsBuffer } from "./files";

export async function createAllRegionData(colorMapName: string, dataCSVName: string): Promise<CreatedRegions> {
  const colorMap = await getFileAsBuffer(colorMapName)
  const dataCSV = await getFileAsBuffer(dataCSVName)

  return (await createRegions(colorMap, dataCSV) as CreatedRegions)
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