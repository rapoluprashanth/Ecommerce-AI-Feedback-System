import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const redisURL = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const redisClient = createClient({
  url: redisURL,
});

redisClient.on('error', (error) => {
  console.error('Redis Client Error', error);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;
