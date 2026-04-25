import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import client from "./src/util/discord";
import { Client, Events } from "discord.js";

import stateRouter from './src/pages/adminState/adminState'
import filesRouter from './src/pages/files'
import regionRouter from './src/pages/region'
import discordAuthRouter from './src/pages/discordLogin'
import { scheduleAllCooldowns } from "./src/dao/region";

const token = process.env.DISCORD_TOKEN
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient: Client) => {
  console.log(`Ready! Logged in as ${readyClient.user?.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

const CONNECTION_STRING =
  process.env.DB_CONNECTION_STRING || "mongodb://localhost:27017/map";
mongoose.connect(CONNECTION_STRING);

const app = express();

// Middleware
app.use(cors(
    {
      credentials: true,
      origin: process.env.FRONTEND_URL || '*'
    }
));

app.use('/state', stateRouter);
app.use('/files', filesRouter);
app.use('/region', regionRouter);
app.use('/discord', discordAuthRouter);

scheduleAllCooldowns()

if (process.env.NODE_ENV !== "test") {
    const port = 8000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

export default app;