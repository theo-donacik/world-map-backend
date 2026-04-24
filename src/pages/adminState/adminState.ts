import express from 'express';
import bodyParser from 'body-parser';

import timerRouter from './timerState'
import channelRouter from './dcChannelState'
import interestRouter from './interestState'
import regionRouter from './worldRegionState'

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

router.use('/timer', timerRouter);
router.use('/discord', channelRouter);
router.use('/interest', interestRouter);
router.use('/region', regionRouter);

export default router;