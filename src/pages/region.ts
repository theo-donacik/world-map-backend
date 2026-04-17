import express from 'express';
import bodyParser from 'body-parser';
import { authenticateToken } from '../util/authToken';
import { createAllRegionData, createRegion, getRegion, getSubregionsOf } from '../dao/region';
import { CreatedRegions, Region } from '../models/region';


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /region
 */
router.post('/', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.colorMapName || !req.body.dataCSVName || !req.body.backgroundMapName) {
    res.status(403).send({message: "Missing region creation parameters"})
    return;
  }

  const allRegionData : CreatedRegions = await createAllRegionData(req.body.colorMapName, req.body.dataCSVName)

  const worldRegion: Region = {
    name: "X",
    description: "X",
    interestedUsers: [],
    parentId: "0",
    subregionImg: req.body.backgroundMapName,
    subregionWidth: allRegionData.width,
    subregionHeight: allRegionData.height,
    vertices: []
  }

  const worldRegionId = await createRegion(worldRegion)

  if(worldRegionId) {
    for(var i in allRegionData.regions) {
      const regionData = allRegionData.regions[i]

      const region: Region = {
        name: regionData.name,
        description: regionData.description,
        interestedUsers: [],
        parentId: worldRegionId ?? "0",
        vertices: regionData.vertices
      }

      const newRegion = await createRegion(region)

      if(!newRegion) {
        res.status(500).send({ message: 'Failed to create sub-region'});
      }
    }

    res.send({"id": worldRegionId ?? "0"})
  }

  else {
    res.status(500).send({ message: 'Failed to create world region'});
  }
});

/**
 * @route GET /region/:parentId
 */
router.get('/:parentId', async (req: any, res: any) => {
  const regions = await getSubregionsOf(req.params.parentId);
  const parentRegion = await getRegion(req.params.parentId);

  if (regions) {
    res.send({ subregions: regions, parent: parentRegion });
  } else {
    res.status(404).send({ message: 'Count not get subregions'});
  }
});

export default router;