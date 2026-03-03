# extension-queue — Reliable Task Queue for Chrome Extensions

[![npm](https://img.shields.io/npm/v/extension-queue.svg)](https://www.npmjs.com/package/extension-queue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

> **Built by [Zovo](https://zovo.one)** — reliable processing across 18+ Chrome extensions

**FIFO queue with retry logic, persistence, concurrency control, and rate limiting** for Chrome extensions. Zero runtime dependencies.

## 📦 Install

```bash
npm install extension-queue
```

## 🚀 Quick Start

```typescript
import { TaskQueue } from 'extension-queue';

// Create a queue with a worker
const queue = new TaskQueue(async (task) => {
    console.log('Processing:', task);
    // Do async work
    await fetch(task.url);
    return 'done';
});

// Add tasks
await queue.enqueue({ url: '/api/1', data: '...' });
await queue.enqueue({ url: '/api/2', data: '...' });

// Process queue
await queue.process();

// Or use event-driven mode
queue.on('task:complete', (result) => {
    console.log('Task done:', result);
});
```

## ✨ Features

### Automatic Retry

Failed tasks are automatically retried:

```typescript
const queue = new TaskQueue(worker, {
    maxRetries: 3,
    retryDelay: 1000,  // ms
    backoff: 'exponential'  // linear | exponential
});
```

### Persistence

Tasks survive browser restart:

```typescript
const queue = new TaskQueue(worker, {
    persist: true,  // Saves to chrome.storage
    storageKey: 'my-queue'
});
```

### Concurrency Control

Process multiple tasks in parallel:

```typescript
const queue = new TaskQueue(worker, {
    concurrency: 3  // Process 3 tasks simultaneously
});
```

### Rate Limiting

Avoid overwhelming APIs:

```typescript
const queue = new TaskQueue(worker, {
    rateLimit: {
        maxRequests: 10,
        perSeconds: 1
    }
});
```

## API Reference

### `TaskQueue`

| Method | Description |
|--------|-------------|
| `enqueue(task)` | Add task to queue |
| `process()` | Start processing |
| `pause()` | Pause processing |
| `resume()` | Resume processing |
| `clear()` | Clear all tasks |
| `size()` | Get queue size |

### Events

```typescript
queue.on('task:start', (task) => {});
queue.on('task:complete', (result) => {});
queue.on('task:error', (error) => {});
queue.on('task:retry', (task, attempt) => {});
queue.on('empty', () => {});
```

## 📄 License

MIT — [Zovo](https://zovo.one)
