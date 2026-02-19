import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import client from "./src/util/discord";
import { Client, Events } from "discord.js";

import loginRouter from './src/pages/login'
import areaRouter from './src/pages/area'
import stateRouter from './src/pages/adminState'
import messageRouter from './src/pages/message'

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
        origin: 'http://localhost:3000'
    }
));
app.use('/login', loginRouter);
app.use('/area', areaRouter);
app.use('/state', stateRouter);
app.use('/message', messageRouter);

if (process.env.NODE_ENV !== "test") {
    const port = 8000;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

export default app;