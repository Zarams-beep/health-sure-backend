// config/redis.js
import IORedis from "ioredis";
import config from "./index.js";

const redis = new IORedis(config.REDIS_URL);

const TTL = config.REDIS_TTL;

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});


export default {
  redis,
  async get(key){
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key,value,ttl =TTL){
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  },
  async del(key){
    await redis.del(key)
  }
};
