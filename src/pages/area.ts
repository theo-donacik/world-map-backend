import express from 'express';
import bodyParser from 'body-parser';
import { addInterestedToken, createArea, editArea, getAllAreas } from '../dao/area';
import { Area } from '../models/area';
import { checkToken } from '../dao/anonUser';
import { authenticateToken } from '../util/authToken';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /area
 */
router.get('/', async (req: any, res: any) => {
  const areas = await getAllAreas();
  
  if (areas) {
    res.send({ areas: areas });
  } else {
    res.status(404).send({ message: 'Count not get areas'});
  }
});

/**
 * @route POST /area
 */
router.post('/', authenticateToken, async (req: any, res: any) => {
  if(!req.body.name || !req.body.description || !req.body.inviteLink) {
    res.status(403).send({message: "Missing area parameters"})
  }
  
  const area = req.body as Area
  area.interestedUsers = []

  const newArea = await createArea(area);

  if (newArea) {
    res.send({ area: newArea });
  } else {
    res.status(500).send({ message: 'Failed to save area'});
  }
});

/**
 * @route POST /area/edit
 */
router.post('/edit', authenticateToken, async (req: any, res: any) => {
  if(!req.body.id || !req.body.area) {
    res.status(403).send({message: "Missing id or area parameters"})
  }
  
  const editedArea = await editArea(req.body.id, req.body.area as Partial<Area>);

  if (editedArea) {
    res.send({ area: editedArea });
  } else {
    res.status(500).send({ message: 'Failed to save area'});
  }
});

/**
 * @route POST /area/interest
 */
router.post('/interest', async (req: any, res: any) => {
  if(!req.body.id || !req.body.token) {
    res.status(403).send({message: "Missing id or token parameters"})
  }

  const validToken = await checkToken(req.body.token)

  if(!validToken) {
    res.status(403).send({message: "Invalid token"})
  }
  
  const addedToken = await addInterestedToken(req.body.id, req.body.token);

  if (addedToken) {
    res.send({ token: addedToken });
  } else {
    res.status(500).send({ message: 'Failed to edit area interest'});
  }
});

export default router;