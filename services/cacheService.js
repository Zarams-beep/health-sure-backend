import redisConfig from "../config/cache.js";

const redis = redisConfig.redis || null;
redis.on("connect", () => {
  console.log("Connected to Redis server");
});

redis.on("error", (error) => {
//   console.error("Redis error:", error);
//   console.log("Error connecting to Redis server");
});

export default {
  redis,
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key, value, ttl = redisConfig.TTL) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  },
  async del(key) {
    await redis.del(key);
  },
};
