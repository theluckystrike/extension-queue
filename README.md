# extension-queue

A TypeScript task queue library designed for Chrome extensions with priority queue, concurrency control, rate limiting, retry logic, and dead letter handling. Built for Manifest V3.

[![npm](https://img.shields.io/npm/v/extension-queue.svg)](https://www.npmjs.com/package/extension-queue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()
[![Build Status](https://img.shields.io/badge/build-passing-green.svg)]()
[![npm downloads](https://img.shields.io/npm/dm/extension-queue.svg)](https://www.npmjs.com/package/extension-queue)

## Why extension-queue?

Chrome extensions running on Manifest V3 face unique challenges:
- **Service workers** can be terminated unexpectedly
- **Background scripts** have limited execution time
- **API rate limits** require careful throttling
- **Data persistence** across extension restarts is critical

extension-queue solves these problems by providing a robust, production-ready task queue that handles priority scheduling, concurrent execution limits, automatic retries, and dead letter management.

## Features

### ⚡ Priority Queue
Tasks are processed based on priority. Higher priority values execute first, ensuring critical tasks are never blocked by less important ones.

```typescript
// High priority (10) - executes first
await queue.add(async () => await criticalSync(), 10);

// Medium priority (5) - executes second
await queue.add(async () => await syncData(), 5);

// Low priority (1) - executes last
await queue.add(async () => await analytics(), 1);
```

### 🔄 FIFO Mode
When priority is equal, tasks are processed in First-In-First-Out order. Use priority 0 for simple FIFO processing:

```typescript
// Process in exact order added
await queue.add(async () => await processFirst(), 0);
await queue.add(async () => await processSecond(), 0);
await queue.add(async () => await processThird(), 0);
```

### ⏱️ Delayed Jobs
Schedule tasks to execute after a specified delay:

```typescript
// Execute after 5 seconds
setTimeout(async () => {
    await queue.add(async () => await delayedTask());
}, 5000);

// Or use a wrapper for cleaner delayed execution
const delayedAdd = (fn, delayMs) => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const result = await queue.add(fn);
            resolve(result);
        }, delayMs);
    });
};

await delayedAdd(async () => await refreshToken(), 60000);
```

### 💾 Persistence with chrome.storage
Persist your queue state across extension restarts using Chrome's storage API:

```typescript
import { TaskQueue } from 'extension-queue';

interface StoredTask {
    id: string;
    fn: string;
    priority: number;
    scheduledAt: number;
}

class PersistentTaskQueue extends TaskQueue {
    private storageKey = 'extension-queue-tasks';

    async persist(): Promise<void> {
        const tasks = this.getPendingTasks(); // custom method to get tasks
        await chrome.storage.local.set({ [this.storageKey]: tasks });
    }

    async restore(): Promise<void> {
        const { [this.storageKey]: tasks } = await chrome.storage.local.get(this.storageKey);
        if (tasks && tasks.length > 0) {
            for (const task of tasks) {
                if (task.scheduledAt <= Date.now()) {
                    await this.add(eval(`(${task.fn})`), task.priority);
                }
            }
        }
    }
}

// Use in your extension
const queue = new PersistentTaskQueue({ concurrency: 3 });

// Restore on extension startup
chrome.runtime.onStartup.addListener(async () => {
    await queue.restore();
});
```

### 🔢 Concurrency Control
Limit simultaneous task execution to prevent resource exhaustion:

```typescript
const queue = new TaskQueue({
    concurrency: 3  // Only 3 tasks run at once
});

// Useful for:
// - Limiting API calls
// - Preventing memory issues
// - Managing browser resources
```

### 🚦 Rate Limiting
Control request frequency to respect API quotas:

```typescript
const queue = new TaskQueue({
    rateLimit: 10,        // Max 10 requests
    ratePeriodMs: 1000   // Per second
});

// Great for:
// - External APIs with rate limits
// - Copyright protection
// - Server-friendly requests
```

### 🔁 Retry with Exponential Backoff
Automatically retry failed tasks with configurable backoff:

```typescript
class BackoffTaskQueue extends TaskQueue {
    async addWithBackoff<T>(
        fn: () => Promise<T>,
        priority: number = 0,
        baseDelayMs: number = 1000
    ): Promise<T> {
        const wrappedFn = async () => {
            let attempts = 0;
            const attempt = async () => {
                try {
                    return await fn();
                } catch (error) {
                    attempts++;
                    if (attempts <= this.maxRetries) {
                        const delay = baseDelayMs * Math.pow(2, attempts - 1);
                        await new Promise(r => setTimeout(r, delay));
                        return await attempt();
                    }
                    throw error;
                }
            };
            return await attempt();
        };
        return await this.add(wrappedFn, priority);
    }
}

const queue = new BackoffTaskQueue({ maxRetries: 3 });
await queue.addWithBackoff(async () => await flakyAPI(), 5, 1000);
```

### 📮 Dead Letter Queue
Handle permanently failed tasks without losing information:

```typescript
const queue = new TaskQueue({ maxRetries: 3 });

// Process failed tasks
const deadLetters = queue.getDeadLetters();
deadLetters.forEach(({ error, task }) => {
    console.error('Failed task:', task);
    console.error('Error:', error.message);
    
    // Options for handling:
    // 1. Log to monitoring service
    // 2. Store in persistent storage for manual review
    // 3. Attempt alternative processing
    // 4. Notify user
});
```

### 👥 Concurrent Workers
Scale your queue across multiple worker contexts:

```typescript
// Background script worker
class QueueWorker {
    private queue: TaskQueue;
    private isProcessing = false;

    constructor() {
        this.queue = new TaskQueue({
            concurrency: 3,
            maxRetries: 2
        });
        
        // Listen for messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'TASK') {
                this.queue.add(async () => {
                    return await this.processTask(message.payload);
                }, message.priority || 0);
            }
        });
    }

    private async processTask(payload: any): Promise<any> {
        // Your task processing logic
        return { success: true, result: payload };
    }
}

new QueueWorker();
```

## Install

```bash
npm install extension-queue
```

Or with yarn:

```bash
yarn add extension-queue
```

## Quick Start

```typescript
import { TaskQueue } from 'extension-queue';

const queue = new TaskQueue({
    concurrency: 3,
    rateLimit: 10,
    ratePeriodMs: 1000,
    maxRetries: 2
});

// Add tasks with priority (higher numbers = higher priority)
await queue.add(async () => {
    const result = await fetch('/api/data');
    return result.json();
}, 10);

await queue.add(async () => {
    console.log('Lower priority task');
}, 5);

// Check queue status
console.log('Queue size:', queue.size);
console.log('Active tasks:', queue.activeCount);
```

## API Reference

### TaskQueue Constructor

```typescript
const queue = new TaskQueue({
    concurrency: 3,           // Maximum concurrent tasks (default: 3)
    rateLimit: 10,            // Max requests per rate period (default: Infinity)
    ratePeriodMs: 1000,       // Rate limit period in ms (default: 1000)
    maxRetries: 3             // Retry failed tasks N times (default: 0)
});
```

### Methods

#### add(fn, priority)

Add a task to the queue.

```typescript
const result = await queue.add(async () => {
    return await doWork();
}, 5); // priority defaults to 0
```

Returns a Promise that resolves with the task's return value.

#### size

Get number of pending tasks in queue.

```typescript
const pending = queue.size;
```

#### activeCount

Get number of currently running tasks.

```typescript
const running = queue.activeCount;
```

#### pending

Get total pending (queued + running).

```typescript
const total = queue.pending;
```

#### getDeadLetters()

Get failed tasks that exceeded retry limit.

```typescript
const failed = queue.getDeadLetters();
// Returns Array<{ error: any; task: string }>
```

#### clear()

Clear all pending tasks and reject their promises.

```typescript
queue.clear();
```

#### drain()

Wait until all tasks complete.

```typescript
await queue.drain();
```

## Advanced Usage

### Integration with chrome.alarms

For long-running tasks, use chrome.alarms to keep the service worker alive:

```typescript
chrome.alarms.create('queue-processor', { periodInMinutes: 0.1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'queue-processor') {
        await queue.drain();
    }
});
```

### Error Handling Best Practices

```typescript
const queue = new TaskQueue({ maxRetries: 3 });

queue.add(async () => {
    try {
        const result = await riskyOperation();
        return result;
    } catch (error) {
        // Custom error handling
        console.error('Operation failed:', error);
        throw error; // Re-throw to trigger retry
    }
}, 5);
```

### Monitoring Queue Health

```typescript
setInterval(() => {
    console.log({
        pending: queue.pending,
        active: queue.activeCount,
        queued: queue.size,
        deadLetters: queue.getDeadLetters().length
    });
}, 10000);
```

## About

extension-queue is maintained by [theluckystrike](https://github.com/theluckystrike). Built for Chrome extension development at [zovo.one](https://zovo.one).

### Zovo

Zovo is a developer tools company specializing in browser extensions and productivity software. Visit [zovo.one](https://zovo.one) to learn more about our products and services.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details.

---

Made with ❤️ by [Zovo](https://zovo.one)
