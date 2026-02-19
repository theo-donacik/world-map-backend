import express from 'express';
import bodyParser from 'body-parser';
import { sendMessage } from '../util/discord';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /message
 */
router.post('/', async (req: any, res: any) => {
  if(!req.body.channelId || !req.body.message ) {
    res.status(403).send({message: "Missing id or message parameter"})
  }
  
  const sent = await sendMessage(req.body.channelId, req.body.message);

  if (sent) {
    res.send({"message": req.body.message});
  } else {
    res.status(500).send({ message: 'Failed to send message'});
  }
});

export default router