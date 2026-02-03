# Activity & Unreads API

Track unread counts, activity events, and subscribe to real-time notifications.

## Functions

### `getGroupAndChannelUnreads`

```typescript
async function getGroupAndChannelUnreads(): Promise<db.ActivityInit>;
```

Fetches all unread counts and activity summaries for groups, channels, and threads.

**Response Data:** `ActivityInit` object containing:
- `baseUnread` - Overall unread state (`{ id, count, notify, updatedAt }`)
- `groupUnreads` - Array of `{ groupId, count, notify, notifyCount, updatedAt }`
- `channelUnreads` - Array of `{ channelId, type, count, countWithoutThreads, notify, updatedAt, firstUnreadPostId }`
- `threadActivity` - Array of `{ channelId, threadId, count, notify, updatedAt, firstUnreadPostId }`

---

### `getThreadUnreadsByChannel`

```typescript
async function getThreadUnreadsByChannel(channel: db.Channel): Promise<db.ThreadUnreadState[]>;
```

Retrieves thread-level unread states for a specific channel.

---

### `getVolumeSettings`

```typescript
async function getVolumeSettings(): Promise<ub.VolumeSettings>;
```

Fetches the current notification volume settings.

---

### `getInitialActivity`

```typescript
async function getInitialActivity(): Promise<{
    events: db.ActivityEvent[];
    relevantUnreads: db.ActivityInit;
}>;
```

Fetches the initial page of activity events across all buckets.

**Response Data:**
- `events` - Array of `ActivityEvent` objects containing:
  - `id` - Event identifier
  - `type` - Event type (e.g., `'post'`, `'reply'`, `'group-ask'`)
  - `bucketId` - `'all'` | `'mentions'` | `'replies'`
  - `timestamp` - When the event occurred
  - `channelId` / `groupId` - Where it happened
  - `postId` / `authorId` - Related post info
  - `isMention` / `shouldNotify` - Notification flags
  - `content` - Event content data
- `relevantUnreads` - `ActivityInit` object

---

### `getPagedActivityByBucket`

```typescript
async function getPagedActivityByBucket(params: {
  cursor: number;
  bucket: db.ActivityBucket
}): Promise<{
    events: db.ActivityEvent[];
    nextCursor: number | null;
    relevantUnreads: db.ActivityInit;
}>;
```

Fetches a page of activity events for a specific bucket with cursor-based pagination.

**Buckets:** `'all'` | `'mentions'` | `'replies'`

---

### `subscribeToActivity`

```typescript
function subscribeToActivity(handler: (event: ActivityEvent) => void): void;
```

Subscribes to real-time activity updates including unread changes and new events.

**Example:**
```typescript
subscribeToActivity((event) => {
  if (event.isMention) {
    console.log('You were mentioned in', event.channelId);
  }
});
```

---

### `ACTIVITY_SOURCE_PAGESIZE`

```typescript
const ACTIVITY_SOURCE_PAGESIZE: number = 30;
```

The default page size for activity queries.
