import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../../dao/adminState';
import { authenticateToken } from '../../util/authToken';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /state/interest
 */
router.get('/', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ interestNum: state.interestNum });
  } else {
    res.status(404).send({ message: 'Count not get interest threshold'});
  }
});

/**
 * @route POST /state/interest
 */
router.post('/', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.interestNum) {
    res.status(403).send({message: "Missing interest parameter"})
    return;
  }
  
  const newState = await setState({interestNum: req.body.interestNum});

  if (newState) {
    res.send({interestNum: newState.interestNum});
  } else {
    res.status(500).send({ message: 'Failed to save interest threshold'});
  }
});

export default router