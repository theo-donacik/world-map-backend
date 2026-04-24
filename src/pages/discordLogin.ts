import express from 'express';
import {request} from 'undici';
import bodyParser from 'body-parser';
import { checkAdminToken, checkUserToken, createDCUser } from '../dao/discordUser';
import { DiscordSession } from '../models/discordUser';
import { randomUUID } from 'node:crypto';
import handoffStore from '../util/handoffStore';
import { User } from 'discord.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());

const clientSecret = process.env.DISCORD_CLIENT_SECRET
const clientId = process.env.DISCORD_CLIENT_ID
const BACKEND_URL = process.env.BACKEND_URL
const FRONTEND_URL = process.env.FRONTEND_URL

function isOauthSuccess(obj: any): obj is DiscordSession {
  return obj?.token_type && obj?.access_token && obj?.expires_in && obj?.refresh_token && obj?.scope;
}

function isUserData(obj: any): obj is User {
  return obj?.id && obj?.username && obj?.global_name;
}

/**
 * @route GET /discord/callback
 */
router.get('/callback', async (req: any, res: any) => {
  const code = req.query.code;

	if (code) {
		try {
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body: new URLSearchParams({
					client_id: clientId ?? "",
					client_secret: clientSecret ?? "",
          code,
					grant_type: 'authorization_code',
					redirect_uri: (BACKEND_URL ?? "") + '/discord/callback',
					scope: 'identify',
				}).toString(),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData = await tokenResponseData.body.json();

      if(isOauthSuccess(oauthData)) {
        const userResult = await request('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
          },
        });

        const userData = await userResult.body.json();

        if(isUserData(userData)) {
          const dcUser = await createDCUser(userData);
          if(dcUser) {
            const handoffCode = randomUUID();
            handoffStore.set(handoffCode, {
              token: dcUser.token,
              expiresAt: Date.now() + 30_000
            })
            return res.redirect(`${FRONTEND_URL}/#/oauth?code=${handoffCode}`)      
          }
        }
        
      }

      return res.redirect(`${FRONTEND_URL}/#/oauth`)      
		} catch (error) {
			console.error(error);
      return res.redirect(`${FRONTEND_URL}/#/oauth`)
		}
	}
});

/**
 * @route GET /discord/session
 */
router.get('/session', (req, res) => {
  const code = req.query?.code as string;

  const entry = handoffStore.get(code);

  if (!entry || Date.now() > entry.expiresAt) {
    return res.status(401).json({ error: 'Invalid or expired code' });
  }

  handoffStore.delete(code); 
  return res.send({ token: entry.token });
});

/**
 * @route POST /discord/validate
 */
router.post('/validate', async (req: any, res: any) => {
  if(!req.body || !req.body.token ) {
    res.status(403).send({message: "No token specified"})
    return;
  }

  await checkUserToken(req.body.token).then((isValid: boolean) => {
    if(isValid) {
      res.send(req.body);
    }
    else {
      res.status(404).send({message: "Cannot validate token"})
    }
  })
});

/**
 * @route POST /discord/validateAdmin
 */
router.post('/validateAdmin', async (req: any, res: any) => {
  if(!req.body || !req.body.token) {
    res.status(403).send({message: "No token specified"})
    return;
  }
  await checkAdminToken(req.body.token).then((isValid: boolean) => {
    if(isValid) {
      res.send(req.body);
    }
    else {
      res.status(403).send({message: "Invalid admin token"})
    }
  })
});


export default router;
