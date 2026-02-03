# Direct Messages API

Create and manage direct messages (1:1 DMs and group DMs).

## Overview

**DM Channel IDs:**
- 1:1 DMs: Use the other person's ship name (e.g., `'~sampel-palnet'`)
- Group DMs: Use a generated identifier (e.g., `'0v4.00000.qd4p2.it253.qs53q.s53qs'`)

To send messages to DMs, use `sendPost` from the [Posts API](posts.md) with the DM channel ID.

---

## Functions

### `markChatRead`

```typescript
async function markChatRead(whom: string): Promise<void>;
```

Marks all messages in a chat (DM or channel) as read.

**Example - Mark a channel as read:**
```typescript
await markChatRead('chat/~sampel-palnet/general');
```

**Example - Mark a DM as read:**
```typescript
await markChatRead('~bus');
```

---

### `createGroupDm`

```typescript
async function createGroupDm(params: { id: string; members: string[] }): Promise<void>;
```

Creates a new group DM (multi-person direct message).

**Example:**
```typescript
await createGroupDm({
  id: '0v4.00000.qd4p2.it253.qs53q.s53qs',  // Generate unique ID
  members: ['~zod', '~bus', '~nec']
});

// Then send messages to the group DM:
await sendPost({
  channelId: '0v4.00000.qd4p2.it253.qs53q.s53qs',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [{ inline: ['Hey everyone!'] }]
});
```

---

### `respondToDMInvite`

```typescript
async function respondToDMInvite(params: { channel: db.Channel; accept: boolean }): Promise<void>;
```

Accepts or declines a DM invitation (both regular DMs and group DMs).

**Parameters:**
- `channel` - The `Channel` object representing the DM invite
- `accept` - `true` to accept, `false` to decline

**Example:**
```typescript
// Get pending DM invites from init data
const { channels } = await getInitData();
const pendingInvite = channels.find(c => c.isDmInvite);

if (pendingInvite) {
  // Accept the DM invite
  await respondToDMInvite({
    channel: pendingInvite,
    accept: true
  });
}
```

---

### `updateDMMeta`

```typescript
async function updateDMMeta(params: { channelId: string; meta: db.ClientMeta }): Promise<void>;
```

Updates the metadata (title, description, images) of a group DM channel.

**Parameters:**
- `channelId` - Group DM channel ID (e.g., `'0v4.00000.qd4p2...'`)
- `meta` - `ClientMeta` object with updated display info

**Example:**
```typescript
await updateDMMeta({
  channelId: '0v4.00000.qd4p2.it253.qs53q.s53qs',
  meta: {
    title: 'Project Team Chat',
    description: 'Discussion for Q1 project',
    iconImage: 'https://example.com/team-icon.png'
  }
});
```

---

## Sending DMs

Use `sendPost` from the [Posts API](posts.md):

**Send a 1:1 DM:**
```typescript
import { sendPost, getCurrentUserId } from '@tloncorp/api';

await sendPost({
  channelId: '~sampel-palnet',  // Recipient's ship name
  authorId: getCurrentUserId(),
  sentAt: Date.now(),
  content: [{ inline: ['Hey, how are you?'] }]
});
```

**Send to a Group DM:**
```typescript
await sendPost({
  channelId: '0v4.00000.qd4p2.it253.qs53q.s53qs',
  authorId: getCurrentUserId(),
  sentAt: Date.now(),
  content: [{ inline: ['Team meeting at 3pm!'] }]
});
```

---

## Reading DM History

Use `getChannelPosts` from the [Posts API](posts.md):

```typescript
import { getChannelPosts } from '@tloncorp/api';

// Read 1:1 DM history
const { posts } = await getChannelPosts({
  channelId: '~sampel-palnet',
  count: 50,
  mode: 'newest'
});

// Read group DM history
const { posts: groupPosts } = await getChannelPosts({
  channelId: '0v4.00000.qd4p2.it253.qs53q.s53qs',
  count: 50,
  mode: 'newest'
});
```
