// LRU (Least Recently Used) Cache implementation
export class LRUCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Check size limit
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    // Add to end (most recently used)
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Search result cache
export interface CachedSearchResult<T = unknown> {
  query: string;
  results: T[];
  timestamp: number;
}

export class SearchCache<T = unknown> {
  private cache: LRUCache<string, CachedSearchResult<T>>;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 50, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new LRUCache(maxSize);
    this.ttl = ttl;
  }

  getCacheKey(query: string, filters?: Record<string, unknown>): string {
    return filters ? `${query}::${JSON.stringify(filters)}` : query;
  }

  get(query: string, filters?: Record<string, unknown>): T[] | undefined {
    const key = this.getCacheKey(query, filters);
    const cached = this.cache.get(key);

    if (!cached) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.clear(); // Could also just delete this key
      return undefined;
    }

    return cached.results;
  }

  set(query: string, results: T[], filters?: Record<string, unknown>): void {
    const key = this.getCacheKey(query, filters);
    this.cache.set(key, {
      query,
      results,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Computed value cache for expensive calculations
export class ComputedValueCache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private ttl: number;

  constructor(ttl: number = 60 * 1000) { // 1 minute default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  getOrCompute(key: string, computeFn: () => T): T {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = computeFn();
    this.set(key, value);
    return value;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create singleton instances
export const searchCache = new SearchCache();
export const computedCache = new ComputedValueCache();