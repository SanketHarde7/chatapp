import { Redis } from "ioredis";
import { env } from "../config/env.js";

// enableOfflineQueue: false -> Redis band ho toh command turant fail ho (error mile),
// chupchaap atak kar na rahe. Warna user "Connected" dikhta par kuch chalta nahi.
const options = { enableOfflineQueue: false };
const publisher = new Redis(env.redisUrl, options);
const subscriber = new Redis(env.redisUrl, options);

publisher.on("error", (err) => console.error("redis publisher error:", err.message));
subscriber.on("error", (err) => console.error("redis subscriber error:", err.message));

// channel -> us user ke liye kya karna hai
const handlers = new Map<string, (payload: object) => void>();

subscriber.on("message", (channel, raw) => {
  const handler = handlers.get(channel);
  if (!handler) return;
  try {
    handler(JSON.parse(raw));
  } catch (err) {
    console.error("bad redis message on", channel, err);
  }
});

const channelOf = (userId: string) => `user:${userId}`;

export async function publishToUser(userId: string, payload: object): Promise<void> {
  await publisher.publish(channelOf(userId), JSON.stringify(payload));
}

export async function subscribeUser(userId: string, onMessage: (payload: object) => void): Promise<void> {
    handlers.set(channelOf(userId), onMessage);
    try {
      await subscriber.subscribe(channelOf(userId));
    } catch (err) {
      handlers.delete(channelOf(userId)); // subscribe nahi hua toh handler bhi na rahe
      throw err;
    }
  }

export async function unsubscribeUser(userId: string): Promise<void> {
  handlers.delete(channelOf(userId));
  await subscriber.unsubscribe(channelOf(userId));
}

export async function closeRedis(): Promise<void> {
  await Promise.all([publisher.quit(), subscriber.quit()]);
}