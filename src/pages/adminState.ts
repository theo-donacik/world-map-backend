import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../dao/adminState';
import { getChannels } from '../util/discord';
import { authenticateToken } from '../util/authToken';

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
router.post('/timer', authenticateToken, async (req: any, res: any) => {
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
router.post('/channel', authenticateToken, async (req: any, res: any) => {
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
router.get('/allChannels', authenticateToken, async (req: any, res: any) => {
  const channels = await getChannels();
  
  if (channels) {
    res.send({ channels: channels });
  } else {
    res.status(404).send({ message: 'Count not get channels'});
  }
});

/**
 * @route GET /state/interest
 */
router.get('/interest', async (req: any, res: any) => {
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
router.post('/interest', authenticateToken, async (req: any, res: any) => {
  if(!req.body.interestNum) {
    res.status(403).send({message: "Missing interest parameter"})
  }
  
  const newState = await setState({interestNum: req.body.interestNum});

  if (newState) {
    res.send({interestNum: newState.interestNum});
  } else {
    res.status(500).send({ message: 'Failed to save interest threshold'});
  }
});

/**
 * @route GET /state/message
 */
router.get('/message', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ alertMessage: state.alertMessage });
  } else {
    res.status(404).send({ message: 'Count not get message'});
  }
});

/**
 * @route POST /state/message
 */
router.post('/message', authenticateToken, async (req: any, res: any) => {
  if(!req.body.alertMessage) {
    res.status(403).send({message: "Missing message parameter"})
  }
  
  const newState = await setState({alertMessage: req.body.alertMessage});

  if (newState) {
    res.send({alertMessage: newState.alertMessage});
  } else {
    res.status(500).send({ message: 'Failed to save message'});
  }
});

export default router;