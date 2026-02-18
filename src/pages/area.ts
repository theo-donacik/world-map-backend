import express from 'express';
import bodyParser from 'body-parser';
import { createArea, editArea, getAllAreas } from '../dao/area';
import { Area } from '../models/area';

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
router.post('/', async (req: any, res: any) => {
  if(!req.body.name || !req.body.description || !req.body.inviteLink) {
    res.status(403).send({message: "Missing area parameters"})
  }
  
  const newArea = await createArea(req.body as Area);

  if (newArea) {
    res.send({ area: newArea });
  } else {
    res.status(500).send({ message: 'Failed to save area'});
  }
});

/**
 * @route POST /area/edit
 */
router.post('/edit', async (req: any, res: any) => {
  if(!req.body.id || !req.body.area || !req.body.area.name || !req.body.area.description || !req.body.area.inviteLink) {
    res.status(403).send({message: "Missing parameters"})
  }
  
  const editedArea = await editArea(req.body.id, req.body.area as Area);

  if (editedArea) {
    res.send({ area: editedArea });
  } else {
    res.status(500).send({ message: 'Failed to save area'});
  }
});

export default router;