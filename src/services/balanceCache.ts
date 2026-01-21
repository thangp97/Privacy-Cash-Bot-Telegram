/**
 * Simple in-memory cache with TTL (Time To Live)
 * Used to cache balance results to reduce load on RPC and PrivacyCash
 */

interface CacheItem<T> {
    value: T;
    expiresAt: number;
}

export class BalanceCache {
    private cache: Map<string, CacheItem<any>> = new Map();
    private defaultTTL: number;

    /**
     * @param defaultTTL - Default time-to-live in milliseconds (default: 30 seconds)
     */
    constructor(defaultTTL: number = 30000) {
        this.defaultTTL = defaultTTL;
        
        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Get a cached value
     */
    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value as T;
    }

    /**
     * Set a cached value
     */
    set<T>(key: string, value: T, ttl?: number): void {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + (ttl ?? this.defaultTTL),
        });
    }

    /**
     * Delete a cached value
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cached values for a specific user
     */
    clearUser(userId: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${userId}:`)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cached values
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Singleton instance - 30 second cache for balances
export const balanceCache = new BalanceCache(30000);
