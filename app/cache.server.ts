import NodeCache from "node-cache";

export class Cache {
  private cache: NodeCache;
  private static instance: Cache;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: 86400 }); // TTL 1 ngày
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
      if (process.env.NODE_ENV !== "production") {
        if (!global.__cache) {
          global.__cache = Cache.instance;
        } else {
          Cache.instance = global.__cache;
        }
      }
    }

    return Cache.instance;
  }

  public has(key: string): boolean {
    return this.cache.has(key);
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl as number);
  }

  public del(key: string | string[]): number {
    return this.cache.del(key);
  }

  public getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }

  public flush(): void {
    this.cache.flushAll();
  }

  public isWebhookProcessed(eventId: string, shopDomain: string): boolean {
    const key = `webhook:${shopDomain}:${eventId}`;
    return this.has(key);
  }

  public markWebhookAsProcessed(eventId: string, shopDomain: string): void {
    const key = `webhook:${shopDomain}:${eventId}`;
    this.set(key, true);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __cache: Cache | undefined;
}

export default Cache.getInstance();
