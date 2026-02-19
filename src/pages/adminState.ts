import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../dao/adminState';
import { getChannels } from '../util/discord';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /state/timer
 */
router.get('/timer', async (req: any, res: any) => {
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
router.post('/timer', async (req: any, res: any) => {
  if(!req.body.timer) {
    res.status(403).send({message: "Missing timer parameter"})
  }
  
  const newState = await setState({timer: req.body.timer});

  if (newState) {
    res.send({"timer": newState.timer});
  } else {
    res.status(500).send({ message: 'Failed to save timer'});
  }
});

/**
 * @route GET /state/channel
 */
router.get('/channel', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ channel: state.dcChannel });
  } else {
    res.status(404).send({ message: 'Count not get channel'});
  }
});

/**
 * @route POST /state/channel
 */
router.post('/channel', async (req: any, res: any) => {
  if(!req.body.channelId || !req.body.channelName ) {
    res.status(403).send({message: "Missing id or name parameter"})
  }
  
  const newState = await setState({dcChannel: {name: req.body.channelName, id: req.body.channelId}});

  if (newState) {
    res.send({"channel": newState.dcChannel});
  } else {
    res.status(500).send({ message: 'Failed to save channel'});
  }
});


/**
 * @route GET /state/allChannels
 */
router.get('/allChannels', async (req: any, res: any) => {
  const channels = await getChannels();
  
  if (channels) {
    res.send({ channels: channels });
  } else {
    res.status(404).send({ message: 'Count not get channels'});
  }
});

export default router;