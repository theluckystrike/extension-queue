# extension-queue

A TypeScript task queue library designed for Chrome extensions with priority queue, concurrency control, rate limiting, retry logic, and dead letter handling. Built for Manifest V3.

[![npm](https://img.shields.io/npm/v/extension-queue.svg)](https://www.npmjs.com/package/extension-queue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

## Install

```bash
npm install extension-queue
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

**add(fn, priority)** - Add a task to the queue

```typescript
const result = await queue.add(async () => {
    return await doWork();
}, 5); // priority defaults to 0
```

**size** - Get number of pending tasks in queue

```typescript
const pending = queue.size;
```

**activeCount** - Get number of currently running tasks

```typescript
const running = queue.activeCount;
```

**pending** - Get total pending (queued + running)

```typescript
const total = queue.pending;
```

**getDeadLetters()** - Get failed tasks that exceeded retry limit

```typescript
const failed = queue.getDeadLetters();
// Returns Array<{ error: any; task: string }>
```

**clear()** - Clear all pending tasks and reject their promises

```typescript
queue.clear();
```

**drain()** - Wait until all tasks complete

```typescript
await queue.drain();
```

## Features

### Priority Queue

Tasks are processed in priority order. Higher priority tasks execute first.

```typescript
// High priority
queue.add(highPriorityTask, 10);

// Low priority
queue.add(lowPriorityTask, 1);
```

### Concurrency Control

Limit how many tasks run simultaneously.

```typescript
const queue = new TaskQueue({ concurrency: 2 });
```

### Rate Limiting

Control request frequency to avoid overwhelming APIs.

```typescript
const queue = new TaskQueue({
    rateLimit: 5,        // 5 requests
    ratePeriodMs: 1000  // per second
});
```

### Automatic Retry

Failed tasks retry automatically up to maxRetries attempts.

```typescript
const queue = new TaskQueue({ maxRetries: 3 });

queue.add(async () => {
    if (Math.random() > 0.5) throw new Error('Random failure');
    return 'success';
});
```

### Dead Letter Queue

Tasks that fail after all retries are moved to dead letter queue.

```typescript
const deadLetters = queue.getDeadLetters();
deadLetters.forEach(({ error, task }) => {
    console.error('Failed task:', task, 'Error:', error);
});
```

## About

extension-queue is maintained by [theluckystrike](https://github.com/theluckystrike). Built for Chrome extension development at [zovo.one](https://zovo.one).
