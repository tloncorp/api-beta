# @tloncorp/api

TypeScript API client for Tlon's Urbit applications. Send messages, manage groups, read channels, handle contacts, and subscribe to real-time updates in Tlon (Urbit social apps). Supports group chats, DMs, notebooks (blogs), and galleries.

## When to Use

Use this API when you need to:
- Send or read messages in Tlon channels
- Create, manage, or browse groups
- Send direct messages (1:1 or group DMs)
- Manage contacts and user profiles
- Subscribe to real-time message updates
- Work with Urbit ship data

**Trigger phrases:** "send a message to...", "post to Tlon", "check my messages", "create a group", "who's in this channel", "read the chat", "DM someone", "get my groups"

---

## Installation

```bash
npm install @tloncorp/api
```

---

## Quick Start

### High-Level API (Recommended)

```typescript
import { configureClient, sendPost, getGroups, getCurrentUserId } from '@tloncorp/api';

// Configure once at startup (required before using any API functions)
configureClient({
  shipName: '~zod',
  shipUrl: 'http://localhost:8080',
  getCode: async () => 'lidlut-tabwed-pillex-ridrup',
});

// Now use the API
const myShip = getCurrentUserId();  // '~zod'
const groups = await getGroups();

await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: myShip,
  sentAt: Date.now(),
  content: [{ inline: ['Hello, world!'] }]
});
```

### Low-Level Urbit Class

For direct control over the connection:

```typescript
import { Urbit } from '@tloncorp/api';

const client = new Urbit('http://localhost:8080', 'lidlut-tabwed-pillex-ridrup');
await client.connect();

// Scry for data
const data = await client.scry({ app: 'groups', path: '/groups' });

// Poke an agent
await client.poke({ app: 'hood', mark: 'helm-hi', json: 'hello' });

// Subscribe to updates
client.subscribe({
  app: 'groups',
  path: '/groups',
  event: (data) => console.log('Update:', data),
});
```

**Note:** `new Urbit()` and `configureClient()` are separate. The Urbit class does NOT configure the singleton used by high-level functions.

---

## ID Formats

Understanding ID formats is critical for using this API correctly.

### User IDs
Urbit ship names, always prefixed with `~`:
```typescript
const userId = '~sampel-palnet';
```

### Group IDs
Host ship + group name:
```typescript
const groupId = '~sampel-palnet/my-group';
```

### Channel IDs

**Group channels** — type/host/name:
```typescript
const chat = 'chat/~sampel-palnet/general';
const notebook = 'diary/~sampel-palnet/blog';
const gallery = 'heap/~sampel-palnet/photos';
```

**DM channels** — just the other user's ship:
```typescript
const dm = '~zod';
```

**Group DMs** — generated identifier:
```typescript
const groupDm = '0v4.00000.qd4p2.it253.qs53q.s53qs';
```

### ID Helpers

```typescript
import { isDmChannelId, isGroupChannelId, getChannelIdType } from '@tloncorp/api';

isDmChannelId('~zod');                    // true
isGroupChannelId('chat/~zod/general');    // true
getChannelIdType('~zod');                 // 'dm'
getChannelIdType('chat/~zod/general');    // 'channel'
```

---

## Core Data Types

### Group
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | `~host/group-name` |
| `title` | `string?` | Display name |
| `description` | `string?` | Group description |
| `privacy` | `'public' \| 'private' \| 'secret'` | Visibility |
| `hostUserId` | `string` | Ship hosting the group |
| `memberCount` | `number?` | Total members |
| `channels` | `Channel[]?` | Nested channels |

### Channel
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Channel identifier |
| `type` | `'chat' \| 'notebook' \| 'gallery' \| 'dm' \| 'groupDm'` | Channel type |
| `groupId` | `string?` | Parent group (null for DMs) |
| `title` | `string?` | Display name |
| `unreadCount` | `number?` | Unread messages |

### Post
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Post identifier |
| `authorId` | `string` | Author's ship |
| `channelId` | `string` | Channel where posted |
| `content` | `Story` | Rich content |
| `textContent` | `string?` | Plain text extraction |
| `sentAt` | `number` | Unix timestamp (ms) |
| `replyCount` | `number?` | Number of replies |
| `reactions` | `Reaction[]?` | Emoji reactions |

### Contact
| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Ship name |
| `nickname` | `string?` | Display name |
| `avatarImage` | `string?` | Avatar URL |
| `bio` | `string?` | Profile bio |
| `isBlocked` | `boolean?` | Blocked status |

---

## Message Content (Story)

Messages use the `Story` format — an array of content blocks:

```typescript
// Plain text
const text: Story = [{ inline: ['Hello, world!'] }];

// With mention
const mention: Story = [{ inline: ['Hello ', { ship: '~zod' }, '!'] }];

// With link
const link: Story = [{ inline: [{ link: { href: 'https://example.com', content: 'Click' } }] }];

// With formatting
const formatted: Story = [{ inline: [{ bold: ['Important'] }, ' - ', { italics: ['note'] }] }];

// With image
const image: Story = [{ block: { image: { src: 'https://example.com/img.png', alt: 'desc', width: 800, height: 600 } } }];

// With code block
const code: Story = [{ block: { code: { code: 'const x = 1;', lang: 'typescript' } } }];
```

---

## Common Workflows

### Send a Message to a Channel

```typescript
import { configureClient, sendPost, getCurrentUserId } from '@tloncorp/api';

configureClient({ shipName: '~zod', shipUrl: 'http://localhost:8080', getCode: async () => 'your-code' });

await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: getCurrentUserId(),
  sentAt: Date.now(),
  content: [{ inline: ['Hello everyone!'] }]
});
```

### Send a Direct Message

```typescript
// DM channel ID is just the recipient's ship name
await sendPost({
  channelId: '~sampel-palnet',  // The person you're DMing
  authorId: getCurrentUserId(),
  sentAt: Date.now(),
  content: [{ inline: ['Hey, how are you?'] }]
});
```

### Read Messages from a Channel

```typescript
import { getChannelPosts } from '@tloncorp/api';

// Get the 50 newest messages
const { posts, cursor } = await getChannelPosts({
  channelId: 'chat/~sampel-palnet/general',
  count: 50,
  mode: 'newest'
});

// Paginate for older messages
if (cursor) {
  const { posts: older } = await getChannelPosts({
    channelId: 'chat/~sampel-palnet/general',
    cursor,
    count: 50,
    mode: 'older'
  });
}
```

### Read DM History

```typescript
const { posts } = await getChannelPosts({
  channelId: '~sampel-palnet',  // DM channel = other person's ship
  count: 50,
  mode: 'newest'
});
```

### List All Groups

```typescript
import { getGroups } from '@tloncorp/api';

const groups = await getGroups();
groups.forEach(g => console.log(g.title, g.id));
```

### Create a Group and Invite Members

```typescript
import { createGroup, inviteGroupMembers, getCurrentUserId } from '@tloncorp/api';

const group = await createGroup({
  group: {
    id: '',  // Auto-generated
    title: 'My Community',
    description: 'A place for discussion',
    privacy: 'private',
    currentUserIsMember: true,
    currentUserIsHost: true,
    hostUserId: getCurrentUserId()
  }
});

await inviteGroupMembers({
  groupId: group.id,
  contactIds: ['~sampel-palnet', '~littel-wolfur']
});
```

### Create a Channel in a Group

```typescript
import { createChannel, getCurrentUserId } from '@tloncorp/api';

await createChannel({
  id: `chat/${getCurrentUserId()}/announcements`,
  kind: 'chat',
  group: '~zod/my-community',
  name: 'announcements',
  title: 'Announcements',
  description: 'Important updates',
  readers: [],       // All members can read
  writers: ['admin'] // Only admin role can write
});
```

### Subscribe to Real-Time Updates

```typescript
import { subscribeToChannelsUpdates } from '@tloncorp/api';

await subscribeToChannelsUpdates((update) => {
  switch (update.type) {
    case 'post':
      console.log('New message:', update.post.textContent);
      break;
    case 'reply':
      console.log('New reply to:', update.parentId);
      break;
    case 'delete':
      console.log('Message deleted:', update.postId);
      break;
  }
});
```

### Add a Reaction

```typescript
import { addReaction, getCurrentUserId } from '@tloncorp/api';

await addReaction({
  channelId: 'chat/~sampel-palnet/general',
  postId: '170690000000000',
  emoji: '👍',
  our: getCurrentUserId(),
  postAuthor: '~bus'
});
```

### Get All Contacts

```typescript
import { getContacts } from '@tloncorp/api';

const contacts = await getContacts();
contacts.forEach(c => console.log(c.nickname || c.id));
```

### Search a Channel

```typescript
import { searchChannel } from '@tloncorp/api';

const { posts } = await searchChannel({
  channelId: 'chat/~sampel-palnet/general',
  query: 'meeting tomorrow'
});
```

### Initialize App (Load Everything)

```typescript
import { getInitData } from '@tloncorp/api';

const { groups, channels, unreads, pins } = await getInitData();
// groups: all groups you're in
// channels: all channels including DMs
// unreads: unread counts per group/channel
// pins: your pinned items
```

---

## Error Handling

```typescript
import { BadResponseError, TimeoutError, AuthError } from '@tloncorp/api';

try {
  await sendPost({ ... });
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Invalid access code');
  } else if (error instanceof BadResponseError) {
    console.error(`HTTP ${error.status}: ${error.body}`);
  } else if (error instanceof TimeoutError) {
    console.error(`Timeout after ${error.timeoutDuration}ms`);
  }
}
```

---

## API Reference

Detailed documentation for each API domain:

| Reference | Description |
|-----------|-------------|
| [Core Client](docs/core.md) | `configureClient`, `Urbit` class, `poke`, `scry`, `subscribe` |
| [Groups](docs/groups.md) | Create, update, delete groups; manage members, roles, navigation |
| [Channels](docs/channels.md) | Create channels, manage membership, search, subscribe to updates |
| [Posts & Messages](docs/posts.md) | Send, edit, delete posts; reactions; fetch and paginate messages |
| [Direct Messages](docs/dms.md) | DMs, group DMs, invites |
| [Contacts](docs/contacts.md) | Fetch and update contacts |
| [Activity & Unreads](docs/activity.md) | Unread counts, activity events, subscriptions |
| [Settings & Storage](docs/settings.md) | User settings, app info, file uploads |
| [Utilities](docs/utilities.md) | ID helpers, date conversion, Urbit utilities |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SHIP_URL` | Ship's HTTP URL |
| `SHIP_NAME` | Ship name (without ~) |
| `SHIP_CODE` | Access code |

---

## Examples

See [examples/cli](./examples/cli) for a working CLI example.
