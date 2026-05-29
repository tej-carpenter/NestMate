type Bucket = {
  tokens: number;
  updatedAt: number;
};

const buckets = new Map<string, Bucket>();

export function createTokenBucketRateLimiter(options: { capacity: number; refillPerSecond: number }) {
  return function isAllowed(key: string) {
    const now = Date.now();
    const bucket = buckets.get(key) ?? { tokens: options.capacity, updatedAt: now };
    const elapsedSeconds = (now - bucket.updatedAt) / 1000;
    const refilledTokens = elapsedSeconds * options.refillPerSecond;
    bucket.tokens = Math.min(options.capacity, bucket.tokens + refilledTokens);
    bucket.updatedAt = now;

    if (bucket.tokens < 1) {
      buckets.set(key, bucket);
      return false;
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return true;
  };
}