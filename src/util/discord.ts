import { Client, ForumChannel, GatewayIntentBits, TextChannel, ThreadChannel } from "discord.js";
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

export interface DCChannel {
  id: string,
  name: string
}

export async function getTextChannels(): Promise<DCChannel[]> {
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
        resolve(getTextChannels())
      }) 
    })
  }
}

export async function getThreadChannels(): Promise<DCChannel[]> {
  if(client.isReady()) {
    const c: DCChannel[] = []

    const channels = client.channels.cache
    channels.forEach(channel => {
      if(channel.isThreadOnly()) {
        const name = (channel as ForumChannel).name
        c.push({name: name, id: channel.id})
      }
    });

    return c
  }
  else {
    return new Promise(resolve => {
      client.on('clientReady', () => {
        resolve(getTextChannels())
      }) 
    })
  }
}

export async function sendMessage(id: string, message: string): Promise<string | null> {
  if(client.isReady()) {
    const channel = client.channels.cache.get(id)
    if(channel && (channel.isThread() || channel.isTextBased())) {
      (channel as ThreadChannel).send(message)
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


export async function findInterestThread(channelId: string, threadName: string): Promise<string | false>  {
  if(client.isReady()) {
    const channel = client.channels.cache.get(channelId)

    if(channel && channel.isThreadOnly()) {
      const thread = (channel as ForumChannel).threads.cache.find((x) => x.name === threadName);
      if (thread) {
        return new Promise(resolve => resolve(thread.id))
      }
    }
    return new Promise(resolve => resolve(false))
  }

  else {
    return new Promise(resolve => {
      client.on('clientReady', () => {
        resolve(findInterestThread(channelId, threadName))
      }) 
    })
  }
}

export async function createInterestThread(channelId: string, threadName: string, initialMessage: string): Promise<string | false> {
  if(client.isReady()) {
    const channel = client.channels.cache.get(channelId)

    if(await findInterestThread(channelId, threadName)) {
      return false
    }
    else {
      const thread = await (channel as ForumChannel).threads.create({
        name: threadName,
        message: {
          content: initialMessage
        },
      });
      return thread.id
    }
  }
  else {
    return new Promise(resolve => {
      client.on('clientReady', () => {
        resolve(createInterestThread(channelId, threadName, initialMessage))
      }) 
    })
  }
}


export default client