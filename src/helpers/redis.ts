import Redis from "ioredis";
import { redis_connection_url } from "./environment";

export const redis = new Redis(redis_connection_url);
