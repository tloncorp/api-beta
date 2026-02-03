# Channels API

Create and manage channels, including membership, search, and real-time subscriptions.

## Channel Creation

### `createChannel`

```typescript
async function createChannel(params: ub.Create & { id: string }): Promise<void>;
```

**Parameters:**
- `id: string` - Channel identifier (e.g., `'chat/~zod/my-channel'`)
- `kind: string` - Channel type: `'chat'` | `'diary'` | `'heap'`
- `group: string` - Group ID to create the channel in
- `name: string` - URL-safe channel name
- `title: string` - Display title
- `description: string` - Channel description
- `readers: string[]` - Role IDs that can read (empty = all members)
- `writers: string[]` - Role IDs that can write (empty = all members)

**Example - Create a chat channel:**
```typescript
await createChannel({
  id: 'chat/~sampel-palnet/announcements',
  kind: 'chat',
  group: '~sampel-palnet/book-club',
  name: 'announcements',
  title: 'Announcements',
  description: 'Important updates from admins',
  readers: [],        // All members can read
  writers: ['admin']  // Only admin role can write
});
```

**Example - Create a notebook:**
```typescript
await createChannel({
  id: 'diary/~sampel-palnet/blog',
  kind: 'diary',
  group: '~sampel-palnet/book-club',
  name: 'blog',
  title: 'Book Reviews',
  description: 'Member book reviews and recommendations',
  readers: [],
  writers: []  // All members can post
});
```

**Example - Create a gallery:**
```typescript
await createChannel({
  id: 'heap/~sampel-palnet/photos',
  kind: 'heap',
  group: '~sampel-palnet/book-club',
  name: 'photos',
  title: 'Book Photos',
  description: 'Share photos of your reading setup',
  readers: [],
  writers: []
});
```

---

### `updateChannelMeta`

```typescript
async function updateChannelMeta(channelId: string, metaPayload: Stringified<ub.ChannelMetadataSchemaV1> | null): Promise<void>;
```

Updates the metadata for an existing channel.

---

### `setupChannelFromTemplate`

```typescript
async function setupChannelFromTemplate(exampleChannelId: string, targetChannelId: string): Promise<any>;
```

Configures a target channel using another channel as a template.

---

### `createNewGroupDefaultChannel`

```typescript
async function createNewGroupDefaultChannel(params: { groupId: string; currentUserId: string }): Promise<void>;
```

Creates a new default "Welcome" chat channel for a group.

---

## Channel Membership

### `joinChannel`

```typescript
async function joinChannel(channelId: string, groupId: string): Promise<void>;
```

Joins an existing channel within a group.

---

### `leaveChannel`

```typescript
async function leaveChannel(channelId: string): Promise<void>;
```

Leaves an existing channel.

---

### `addChannelWriters`

```typescript
async function addChannelWriters(params: { channelId: string; writers: string[] }): Promise<void>;
```

Adds ships as writers to a channel.

---

### `removeChannelWriters`

```typescript
async function removeChannelWriters(params: { channelId: string; writers: string[] }): Promise<void>;
```

Removes ships as writers from a channel.

---

## Channel Data

### `searchChannel`

```typescript
async function searchChannel(params: { channelId: string; query: string; cursor?: string }): Promise<{ posts: db.Post[]; cursor: string }>;
```

Searches for posts matching a text query within a channel.

**Example:**
```typescript
const { posts, cursor } = await searchChannel({
  channelId: 'chat/~sampel-palnet/general',
  query: 'meeting tomorrow'
});

// Paginate results:
const { posts: morePosts } = await searchChannel({
  channelId: 'chat/~sampel-palnet/general',
  query: 'meeting tomorrow',
  cursor: cursor
});
```

---

### `getChannelHooksPreview`

```typescript
async function getChannelHooksPreview(channelId: string): Promise<ub.ChannelHooksPreview>;
```

Retrieves a preview of the hooks configured for a channel.

---

### `setOrder`

```typescript
async function setOrder(channelId: string, arrangedPostIds: string[]): Promise<void>;
```

Sets the display order of posts within a channel.

---

### `subscribeToChannelsUpdates`

```typescript
async function subscribeToChannelsUpdates(eventHandler: (update: ChannelsUpdate) => void): Promise<void>;
```

Subscribes to real-time channel updates including post additions, deletions, reactions, and lifecycle events.

**Example:**
```typescript
await subscribeToChannelsUpdates((update) => {
  switch (update.type) {
    case 'post':
      console.log('New post:', {
        channelId: update.channelId,
        postId: update.post.id,
        author: update.post.authorId,
        content: update.post.textContent
      });
      break;
    case 'reply':
      console.log('New reply to', update.parentId);
      break;
    case 'delete':
      console.log('Post deleted:', update.postId);
      break;
    case 'reaction':
      console.log('Reaction added:', update.emoji, 'by', update.contactId);
      break;
  }
});
```
