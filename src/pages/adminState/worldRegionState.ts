import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../../dao/adminState';
import { authenticateToken } from '../../util/authToken';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /state/region
 */
router.get('/', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ region: state.defaultWorldRegion });
  } else {
    res.status(404).send({ message: 'Count not get world region'});
  }
});

/**
 * @route POST /state/region
 */
router.post('/', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.region) {
    res.status(403).send({message: "Missing region parameter"})
    return;
  }
  
  const newState = await setState({defaultWorldRegion: req.body.region});

  if (newState) {
    res.send({"region": newState.defaultWorldRegion});
  } else {
    res.status(500).send({ message: 'Failed to save region'});
  }
});

export default router