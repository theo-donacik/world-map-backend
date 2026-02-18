import express from 'express';
import bodyParser from 'body-parser';
import { deleteTimers, getTimer, setTimer } from '../dao/timer';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /timer
 */
router.get('/', async (req: any, res: any) => {
  const timer = await getTimer();
  
  if (timer) {
    res.send({ timer: timer });
  } else {
    res.status(404).send({ message: 'Count not get timer'});
  }
});

/**
 * @route POST /timer
 */
router.post('/', async (req: any, res: any) => {
  if(!req.body.timer) {
    res.status(403).send({message: "Missing time parameter"})
  }
  
  await deleteTimers()

  const newTime = await setTimer(req.body.timer);

  if (newTime) {
    res.send({ timer: newTime });
  } else {
    res.status(500).send({ message: 'Failed to save timer'});
  }
});

export default router;