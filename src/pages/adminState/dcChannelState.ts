import express from 'express';
import bodyParser from 'body-parser';
import { getAdminState, setState } from '../../dao/adminState';
import { authenticateToken } from '../../util/authToken';
import { getTextChannels, getThreadChannels } from '../../util/discord';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route GET /state/discord/organize
 */
router.get('/organize', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ channel: state.organizeChannel });
  } else {
    res.status(404).send({ message: 'Count not get channel'});
  }
});

/**
 * @route GET /state/discord/updates
 */
router.get('/updates', async (req: any, res: any) => {
  const state = await getAdminState();
  
  if (state) {
    res.send({ channel: state.updatesChannel });
  } else {
    res.status(404).send({ message: 'Count not get channel'});
  }
});

/**
 * @route POST /state/channel/organize
 */
router.post('/organize', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.channelId || !req.body.channelName ) {
    res.status(403).send({message: "Missing id or name parameter"})
    return;
  }
  
  const newState = await setState({organizeChannel: {name: req.body.channelName, id: req.body.channelId}});

  if (newState) {
    res.send({"channel": newState.organizeChannel});
  } else {
    res.status(500).send({ message: 'Failed to save channel'});
  }
});

/**
 * @route POST /state/channel/updates
 */
router.post('/updates', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.channelId || !req.body.channelName ) {
    res.status(403).send({message: "Missing id or name parameter"})
    return;
  }
  
  const newState = await setState({updatesChannel: {name: req.body.channelName, id: req.body.channelId}});

  if (newState) {
    res.send({"channel": newState.updatesChannel});
  } else {
    res.status(500).send({ message: 'Failed to save channel'});
  }
});

/**
 * @route GET /state/discord/textChannels
 */
router.get('/textChannels', authenticateToken, async (req: any, res: any) => {
  const channels = await getTextChannels();
  
  if (channels) {
    res.send({ channels: channels });
  } else {
    res.status(404).send({ message: 'Count not get channels'});
  }
});

/**
 * @route GET /state/discord/threadChannels
 */
router.get('/threadChannels', authenticateToken, async (req: any, res: any) => {
  const channels = await getThreadChannels();
  
  if (channels) {
    res.send({ channels: channels });
  } else {
    res.status(404).send({ message: 'Count not get channels'});
  }
});

/**
 * @route GET /state/discord/message
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
 * @route POST /state/discord/message
 */
router.post('/message', authenticateToken, async (req: any, res: any) => {
  if(!req.body || !req.body.alertMessage) {
    res.status(403).send({message: "Missing message parameter"})
    return
  }
  
  const newState = await setState({alertMessage: req.body.alertMessage});

  if (newState) {
    res.send({alertMessage: newState.alertMessage});
  } else {
    res.status(500).send({ message: 'Failed to save message'});
  }
});

export default router