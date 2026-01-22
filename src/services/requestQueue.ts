/**
 * Simple request queue to prevent concurrent heavy operations
 * This helps prevent blocking when multiple users use the bot simultaneously
 */

interface QueueItem<T> {
    id: string;
    execute: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
    priority: number;
    timestamp: number;
}

export class RequestQueue {
    private queue: QueueItem<any>[] = [];
    private running: Map<string, boolean> = new Map();
    private maxConcurrent: number;
    private processingInterval: NodeJS.Timeout | null = null;

    constructor(maxConcurrent: number = 2) {
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * Add a task to the queue
     * @param userId - User identifier for tracking
     * @param execute - Function to execute
     * @param priority - Higher priority runs first (default 0)
     */
    async enqueue<T>(userId: string, execute: () => Promise<T>, priority: number = 0): Promise<T> {
        return new Promise((resolve, reject) => {
            const item: QueueItem<T> = {
                id: userId,
                execute,
                resolve,
                reject,
                priority,
                timestamp: Date.now(),
            };

            // Add to queue sorted by priority (higher first) then timestamp (older first)
            const insertIndex = this.queue.findIndex(
                q => q.priority < priority || (q.priority === priority && q.timestamp > item.timestamp)
            );
            
            if (insertIndex === -1) {
                this.queue.push(item);
            } else {
                this.queue.splice(insertIndex, 0, item);
            }

            this.processQueue();
        });
    }

    /**
     * Process items in the queue
     */
    private async processQueue(): Promise<void> {
        // Count currently running tasks
        const runningCount = Array.from(this.running.values()).filter(v => v).length;
        
        if (runningCount >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        // Get next item that isn't already running for this user
        const itemIndex = this.queue.findIndex(item => !this.running.get(item.id));
        if (itemIndex === -1) return;

        const item = this.queue.splice(itemIndex, 1)[0];
        this.running.set(item.id, true);

        try {
            const result = await item.execute();
            item.resolve(result);
        } catch (error) {
            item.reject(error);
        } finally {
            this.running.set(item.id, false);
            // Process next item
            setImmediate(() => this.processQueue());
        }
    }

    /**
     * Get queue status
     */
    getStatus(): { queueLength: number; runningCount: number } {
        return {
            queueLength: this.queue.length,
            runningCount: Array.from(this.running.values()).filter(v => v).length,
        };
    }

    /**
     * Clear queue for a specific user
     */
    clearUser(userId: string): void {
        this.queue = this.queue.filter(item => item.id !== userId);
        this.running.delete(userId);
    }
}

// Singleton instance for global use
export const globalRequestQueue = new RequestQueue(3); // Allow 3 concurrent operations
