# extension-queue — Task Queue with Concurrency
> **Built by [Zovo](https://zovo.one)** | `npm i extension-queue`

Priority queue, concurrency control, rate limiting, retries, dead letter queue, and drain.

```typescript
import { TaskQueue } from 'extension-queue';
const queue = new TaskQueue({ concurrency: 3, rateLimit: 10, ratePeriodMs: 1000, maxRetries: 2 });
await queue.add(() => fetch(url), 1);
await queue.drain();
```
MIT License
