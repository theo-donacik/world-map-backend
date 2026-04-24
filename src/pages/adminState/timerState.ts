import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../../dao/adminState';
import { authenticateToken } from '../../util/authToken';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /state/timer
 */
router.get('/', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ timer: state.timer });
  } else {
    res.status(404).send({ message: 'Count not get timer'});
  }
});

/**
 * @route POST /state/timer
 */
router.post('/', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.timer) {
    res.status(403).send({message: "Missing timer parameter"})
    return;
  }
  
  const newState = await setState({timer: req.body.timer});

  if (newState) {
    res.send({"timer": newState.timer});
  } else {
    res.status(500).send({ message: 'Failed to save timer'});
  }
});

export default router