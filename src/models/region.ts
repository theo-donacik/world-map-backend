import mongoose, { ObjectId } from "mongoose";

export const regionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    interestedUsers: { type: [String], required: true },
    parentId: { type: String, required: true },
    subregionImg: { type: String, required: false },
    subregionWidth: { type: Number, required: false },
    subregionHeight: { type: Number, required: false },
    vertices: { type: [Number], required: true }
  },
  { collection: "regions" }
);

export const regionModel = mongoose.model("RegionModel", regionSchema);

export interface Region {
  name: string
  description: string
  parentId: string
  interestedUsers: string[]
  subregionImg?: string | null | undefined
  subregionWidth?: number | null | undefined
  subregionHeight?: number | null | undefined
  vertices: number[]
}

export interface CreatedRegions {
    width: number,
    height: number,
    regions: {
        name: string;
        description: string;
        vertices: number[];
    }[];
}

