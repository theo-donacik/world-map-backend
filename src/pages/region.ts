import express from 'express';
import bodyParser from 'body-parser';
import { authenticateToken } from '../util/authToken';
import { addInterestedToken, createAllRegionData, createRegion, deleteRegion, editRegion, getRegion, getSubregionsOf } from '../dao/region';
import { Region } from '../models/region';
import { checkUserToken } from '../dao/discordUser';
import { getAdminState, initializeInterestThread, sendNewUserInterestMessage } from '../dao/adminState';
import { findInterestThread, sendMessage } from '../util/discord';


const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /region/create
 */
router.post('/create', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.colorMapName || !req.body.dataCSVName || !req.body.backgroundMapName) {
    res.status(403).send({message: "Missing region creation parameters"})
    return;
  }

  const allRegionData = await createAllRegionData(req.body.colorMapName, req.body.dataCSVName)

  if(!allRegionData) {
    res.status(500).send({ message: 'Failed to generate regions (bad csv?)'}); 
    return
  }

  const worldRegion: Region = {
    name: "X",
    description: "X",
    mission: "X",
    level: "X",
    reward: "X",
    interestedUsers: [],
    parentId: "0",
    colorMapColor: "255, 255, 255",
    colorMapImg: req.body.colorMapName,
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
        mission: regionData.mission,
        level: regionData.level,
        reward: regionData.reward,
        interestedUsers: [],
        colorMapColor: regionData.color,
        parentId: worldRegionId ?? "0",
        vertices: regionData.vertices
      }

      const newRegion = await createRegion(region)

      if(!newRegion) {
        res.status(500).send({ message: 'Failed to create sub-region'});
      }
    }

    res.send({"region": worldRegionId ?? "0"})
  }

  else {
    res.status(500).send({ message: 'Failed to create world region'});
  }
});

/**
 * @route POST /region/create/:regionId
 */
router.post('/create/:parentId', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.colorMapName || !req.body.dataCSVName || !req.body.backgroundMapName) {
    res.status(403).send({message: "Missing region creation parameters"})
    return;
  }

  const allRegionData = await createAllRegionData(req.body.colorMapName, req.body.dataCSVName)

  if(!allRegionData) {
    res.status(500).send({ message: 'Failed to generate regions (bad csv?)'}); 
    return
  }

  var subregions = []
  for(var i in allRegionData.regions) {
    const regionData = allRegionData.regions[i]

    const region: Region = {
      name: regionData.name,
      description: regionData.description,
      mission: regionData.mission,
      level: regionData.level,
      reward: regionData.reward,
      interestedUsers: [],
      colorMapColor: regionData.color,
      parentId: req.params.parentId,
      vertices: regionData.vertices
    }

    const newRegion = await createRegion(region)

    if(!newRegion) {
      res.status(500).send({ message: 'Failed to create sub-region'});
      return
    }

    subregions.push(newRegion)
  }

  const editedRegion = await editRegion(req.params.parentId, {
    colorMapImg: req.body.colorMapName,
    subregionImg: req.body.backgroundMapName,
    subregionWidth: allRegionData.width,
    subregionHeight: allRegionData.height,
  })

  if(!editedRegion) {
    res.status(500).send({ message: 'Failed to update parent'});
    return
  }

  res.send({parent: editedRegion, subregions: subregions})
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

/**
 * @route POST /region/edit
 */
router.post('/edit', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.id || !req.body.region) {
    res.status(403).send({message: "Missing id or region parameters"})
    return;
  }
  
  const editedRegion = await editRegion(req.body.id, req.body.region as Partial<Region>);

  if (editedRegion) {
    res.send({ region: editedRegion });
  } else {
    res.status(500).send({ message: 'Failed to save region'});
  }
});

/**
 * @route POST /region/delete
 */
router.post('/delete', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.id) {
    res.status(403).send({message: "Missing id parameter"})
    return;
  }
  
  const deletedRegion = await deleteRegion(req.body.id);

  if (deletedRegion) {
    res.send({ region: deletedRegion });
  } else {
    res.status(500).send({ message: 'Failed to delete region'});
  }
});

/**
 * @route POST /region/interest
 */
router.post('/interest', async (req: any, res: any) => {
  if(!req.body || !req.body.id || !req.body.token) {
    res.status(403).send({message: "Missing id or token parameter"})
    return;
  }

  if (await checkUserToken(req.body.token)) {
    const addedToken = await addInterestedToken(req.body.id, req.body.token);
    
    if (addedToken) {
      res.send({ token: addedToken });

      getAdminState().then((state) => {
        getRegion(req.body.id).then(async (region) => {
          if(state && region && region.interestedUsers.length >= state.interestNum) {
            findInterestThread(state.dcChannel.id, region.mission).then((threadId) => {
              if(threadId) {
                sendNewUserInterestMessage(threadId, req.body.token)
              }
              else {
                initializeInterestThread(region, state.alertMessage, state.dcChannel.id)
              }
            })
          }
        })
      })

    } else {
      res.status(500).send({ message: 'Failed to edit region interest'});
      return;
    }
  }
  else {
    res.status(401).send({ message: 'Invalid token'});
    return;
  }
});

export default router;