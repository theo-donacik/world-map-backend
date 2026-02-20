import express from 'express';
import bodyParser from 'body-parser';
import { checkAdminToken, getUser } from '../dao/adminUser';
import { AdminUser } from "../models/adminUser";
import { checkToken, createUser } from '../dao/anonUser';
import { AnonUser } from '../models/anonUser';

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

  const { username, password } = req.body as AdminUser;

  const user = await getUser(username)

  if (user && user.password == password) {
    res.send({ token: user.token  });
  } else {
    res.status(400).send({message: "Invalid username or password"});
  }
});

/**
 * @route POST /login/anon
 */
router.post('/anon', async (req: any, res: any) => {
  await createUser().then((user : AnonUser | undefined) => {
    if(user) {
      res.send(user);
    }
    else {
      res.status(500).send({message: "Failed to create new user"})
    }
  })
});

/**
 * @route POST /login/validate
 */
router.post('/validate', async (req: any, res: any) => {
  if(!req.body.token ) {
    res.status(403).send({message: "No token specified"})
  }
  await checkToken(req.body.token).then((isValid: boolean) => {
    if(isValid) {
      res.send(req.body);
    }
    else {
      res.status(404).send({message: "Cannot validate token"})
    }
  })
});

/**
 * @route POST /login/validateAdmin
 */
router.post('/validateAdmin', async (req: any, res: any) => {
  if(!req.body.token) {
    res.status(403).send({message: "No token specified"})
  }
  await checkAdminToken(req.body.token).then((isValid: boolean) => {
    if(isValid) {
      res.send(req.body);
    }
    else {
      res.status(404).send({message: "Cannot validate token"})
    }
  })
});


export default router;