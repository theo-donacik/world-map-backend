import express from 'express';
import bodyParser from 'body-parser';
import { isCorrectPassword } from '../dao/user';
import { User } from "../models/user";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

/**
 * @route POST /login
 */
router.post('/', async (req: any, res: any) => {
  if(!req.body.username || !req.body.password) {
    res.status(403).send({message: "No username or password specified"})
  }

  const { username, password } = req.body as User;
  const isCorrect = await isCorrectPassword(username, password);
  if (isCorrect) {
    res.send({ username: username });
  } else {
    res.status(400).send({message: "Invalid username or password"});
  }
});


export default router;