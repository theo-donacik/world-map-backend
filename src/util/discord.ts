import { Client, GatewayIntentBits, TextChannel } from "discord.js";
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

export interface DCChannel {
  id: string,
  name: string
}

export async function getChannels(): Promise<DCChannel[]> {
  if(client.isReady()) {
    const c: DCChannel[] = []

    const channels = client.channels.cache
    channels.forEach(channel => {
      if(channel.isTextBased()) {
        const name = (channel as TextChannel).name + (channel.isVoiceBased() ? " [Voice]" : "")
        c.push({name: name, id: channel.id})
      }
    });

    return c
  }
  else {
    return new Promise(resolve => {
      client.on('clientReady', () => {
        resolve(getChannels())
      }) 
    })
  }
}

export async function sendMessage(id: string, message: string): Promise<string | null> {
  if(client.isReady()) {
    const channel = client.channels.cache.get(id)
    if(channel && channel.isTextBased()) {
      (channel as TextChannel).send(message)
      return message
    }
    else {
      return null
    }
  }
  else {
    return new Promise(resolve => {
      client.on('clientReady', () => {
        resolve(sendMessage(id, message))
      }) 
    })
  }
}


export default client