import { Request, Response, NextFunction } from "express";
import { redis } from "../helpers/redis"; // Import Redis client

export function rateLimitMiddleware(limit: number, duration: number) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const key = `rate_limit:${req.ip}`;

    try {
      const currentCount = await redis.incr(key);
      if (currentCount === 1) {
        await redis.expire(key, duration);
      }

      if (currentCount > limit) {
        throw new Error("Rate limit exceeded");
      }

      next();
    } catch (error) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }
  };
}
