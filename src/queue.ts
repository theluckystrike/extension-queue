/**
 * Task Queue — Priority queue with concurrency control
 */
export interface QueueOptions { concurrency?: number; rateLimit?: number; ratePeriodMs?: number; maxRetries?: number; }

interface QueueItem<T> { fn: () => Promise<T>; priority: number; resolve: (value: T) => void; reject: (error: any) => void; retries: number; }

export class TaskQueue {
    private queue: QueueItem<any>[] = [];
    private running = 0;
    private concurrency: number;
    private rateLimit: number;
    private ratePeriodMs: number;
    private maxRetries: number;
    private rateCount = 0;
    private rateResetTimer: any = null;
    private deadLetter: Array<{ error: any; task: string }> = [];

    constructor(options: QueueOptions = {}) {
        this.concurrency = options.concurrency || 3;
        this.rateLimit = options.rateLimit || Infinity;
        this.ratePeriodMs = options.ratePeriodMs || 1000;
        this.maxRetries = options.maxRetries || 0;
    }

    /** Add task to queue */
    add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, priority, resolve, reject, retries: 0 });
            this.queue.sort((a, b) => b.priority - a.priority);
            this.process();
        });
    }

    /** Process queue */
    private async process(): Promise<void> {
        while (this.running < this.concurrency && this.queue.length > 0 && this.rateCount < this.rateLimit) {
            const item = this.queue.shift();
            if (!item) break;
            this.running++;
            this.rateCount++;
            this.startRateReset();

            try {
                const result = await item.fn();
                item.resolve(result);
            } catch (error) {
                if (item.retries < this.maxRetries) {
                    item.retries++;
                    this.queue.push(item);
                } else {
                    this.deadLetter.push({ error, task: item.fn.toString().slice(0, 100) });
                    item.reject(error);
                }
            } finally {
                this.running--;
                this.process();
            }
        }
    }

    private startRateReset(): void {
        if (this.rateResetTimer) return;
        this.rateResetTimer = setTimeout(() => {
            this.rateCount = 0; this.rateResetTimer = null; this.process();
        }, this.ratePeriodMs);
    }

    /** Get queue size */
    get size(): number { return this.queue.length; }
    get activeCount(): number { return this.running; }
    get pending(): number { return this.queue.length + this.running; }

    /** Get dead letter queue */
    getDeadLetters(): Array<{ error: any; task: string }> { return [...this.deadLetter]; }

    /** Clear queue */
    clear(): void { this.queue.forEach((item) => item.reject(new Error('Queue cleared'))); this.queue = []; }

    /** Pause processing */
    async drain(): Promise<void> {
        if (this.pending === 0) return;
        return new Promise((resolve) => {
            const check = setInterval(() => { if (this.pending === 0) { clearInterval(check); resolve(); } }, 50);
        });
    }
}
