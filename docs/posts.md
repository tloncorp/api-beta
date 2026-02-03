# Posts & Messages API

Send, edit, delete, and fetch posts and messages. Includes reactions and pagination.

## Post Creation

### `sendPost`

```typescript
async function sendPost(params: {
  channelId: string;
  authorId: string;
  sentAt: number;
  content: Story;
  blob?: string;
  metadata?: db.PostMetadata
}): Promise<void>;
```

Sends a new post to a channel (group channel, DM, or group DM).

**Example - Plain text message:**
```typescript
await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [{ inline: ['Hello everyone!'] }]
});
```

**Example - Message with mention and link:**
```typescript
await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [
    {
      inline: [
        'Hey ',
        { ship: '~bus' },
        ', check out this article: ',
        { link: { href: 'https://example.com/article', content: 'Cool Article' } }
      ]
    }
  ]
});
```

**Example - Message with image:**
```typescript
await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [
    { inline: ['Check out this photo:'] },
    { block: { image: { src: 'https://example.com/photo.jpg', alt: 'Sunset', width: 1200, height: 800 } } }
  ]
});
```

**Example - Message with formatting:**
```typescript
await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [
    {
      inline: [
        { bold: ['Important:'] },
        ' Please read the ',
        { italics: ['updated guidelines'] },
        ' before posting.'
      ]
    }
  ]
});
```

**Example - DM to another user:**
```typescript
await sendPost({
  channelId: '~bus',  // DM channel is just the recipient's ship
  authorId: '~zod',
  sentAt: Date.now(),
  content: [{ inline: ['Hey, are you free to chat?'] }]
});
```

**Example - Notebook post with metadata:**
```typescript
await sendPost({
  channelId: 'diary/~sampel-palnet/blog',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [
    { inline: ['This is the first paragraph of my blog post...'] },
    { inline: ['And here is more content with ', { bold: ['emphasis'] }, '.'] }
  ],
  metadata: {
    title: 'My First Blog Post',
    description: 'An introduction to my thoughts on Urbit',
    image: 'https://example.com/blog-header.jpg'
  }
});
```

---

### `sendReply`

```typescript
async function sendReply(params: {
  authorId: string;
  channelId: string;
  parentId: string;
  parentAuthor: string;
  content: Story;
  sentAt: number
}): Promise<void>;
```

Sends a reply to an existing post.

**Example:**
```typescript
await sendReply({
  authorId: '~zod',
  channelId: 'chat/~sampel-palnet/general',
  parentId: '170690000000000',
  parentAuthor: '~bus',
  sentAt: Date.now(),
  content: [{ inline: ['I agree with this point!'] }]
});
```

---

### `editPost`

```typescript
async function editPost(params: {
  channelId: string;
  postId: string;
  authorId: string;
  sentAt: number;
  content: Story;
  parentId?: string;
  metadata?: db.PostMetadata;
  blob?: string
}): Promise<void>;
```

Edits an existing post or reply in a group channel.

**Note:** Editing is not supported for DMs or group DMs.

**Example:**
```typescript
await editPost({
  channelId: 'chat/~sampel-palnet/general',
  postId: '170690000000000',
  authorId: '~zod',
  sentAt: Date.now(),
  content: [{ inline: ['Updated message: I meant to say this instead!'] }]
});
```

---

### `deletePost`

```typescript
async function deletePost(channelId: string, postId: string, authorId: string): Promise<void>;
```

Deletes a top-level post from a channel.

**Example:**
```typescript
await deletePost(
  'chat/~sampel-palnet/general',
  '170690000000000',
  '~zod'
);
```

---

### `deleteReply`

```typescript
async function deleteReply(params: {
  channelId: string;
  parentId: string;
  parentAuthorId: string;
  postId: string;
  authorId: string
}): Promise<void>;
```

Deletes a reply to a post.

---

## Post Visibility

### `hidePost`

```typescript
async function hidePost(post: db.Post): Promise<void>;
```

Hides a post from the user's view.

---

### `showPost`

```typescript
async function showPost(post: db.Post): Promise<void>;
```

Unhides a previously hidden post.

---

### `reportPost`

```typescript
async function reportPost(currentUserId: string, groupId: string, channelId: string, post: db.Post): Promise<void>;
```

Reports a post for moderation and automatically hides it.

---

## Reactions

### `addReaction`

```typescript
async function addReaction(params: {
  channelId: string;
  postId: string;
  emoji: string;
  our: string;
  postAuthor: string;
  parentAuthorId?: string;
  parentId?: string
}): Promise<void>;
```

Adds an emoji reaction to a post or reply.

**Example - React to a post:**
```typescript
await addReaction({
  channelId: 'chat/~sampel-palnet/general',
  postId: '170690000000000',
  emoji: '👍',
  our: '~zod',
  postAuthor: '~bus'
});
```

**Example - React to a reply:**
```typescript
await addReaction({
  channelId: 'chat/~sampel-palnet/general',
  postId: '170690000000001',  // The reply's ID
  emoji: '❤️',
  our: '~zod',
  postAuthor: '~nec',
  parentId: '170690000000000',  // The parent post's ID
  parentAuthorId: '~bus'
});
```

---

### `removeReaction`

```typescript
async function removeReaction(params: {
  channelId: string;
  postId: string;
  our: string;
  postAuthor: string;
  parentId?: string;
  parentAuthorId?: string
}): Promise<void>;
```

Removes the current user's reaction from a post or reply.

---

## Fetching Posts

### `getChannelPosts`

```typescript
async function getChannelPosts(params: {
  channelId: string;
  cursor?: Cursor;
  mode?: 'older' | 'newer' | 'around' | 'newest';
  count?: number;
  includeReplies?: boolean;
  sequenceBoundary?: number | null
}): Promise<GetChannelPostsResponse>;
```

Fetches a paginated list of posts from a channel with cursor-based navigation.

**Response Data:** `{ posts: Post[], cursor?: Cursor }`

Each `Post` contains:
- `id` - Unique post identifier
- `authorId` - Ship that authored the post
- `channelId` - Channel where the post was sent
- `groupId` - Group the channel belongs to
- `type` - `'chat'` | `'note'` | `'block'` | `'reply'` | `'notice'`
- `content` - Story content
- `textContent` - Plain text extraction
- `sentAt` - Timestamp when sent (Unix ms)
- `receivedAt` - Timestamp when received
- `title` / `image` / `description` - Metadata for notebooks/galleries
- `replyCount` - Number of replies
- `replyTime` - Timestamp of most recent reply
- `reactions` - Array of emoji reactions
- `replies` - Array of reply posts (if `includeReplies: true`)
- `isEdited` / `isDeleted` - Edit state flags
- `deliveryStatus` - `'pending'` | `'sent'` | `'failed'`

**Example - Get newest posts:**
```typescript
const { posts, cursor } = await getChannelPosts({
  channelId: 'chat/~sampel-palnet/general',
  count: 50,
  mode: 'newest'
});
```

**Example - Paginate older posts:**
```typescript
const { posts: olderPosts, cursor: nextCursor } = await getChannelPosts({
  channelId: 'chat/~sampel-palnet/general',
  cursor: '170690000000001',
  count: 50,
  mode: 'older'
});
```

**Example - Get posts with replies:**
```typescript
const { posts } = await getChannelPosts({
  channelId: 'chat/~sampel-palnet/general',
  count: 20,
  mode: 'newest',
  includeReplies: true
});
```

**Example - Get DM messages:**
```typescript
const { posts } = await getChannelPosts({
  channelId: '~bus',  // DM channel ID is the other person's ship
  count: 50,
  mode: 'newest'
});
```

---

### `getInitialPosts`

```typescript
async function getInitialPosts(config: { channelCount: number; postCount: number }): Promise<db.Post[]>;
```

Fetches initial posts from multiple channels at once for app initialization.

---

### `getLatestPosts`

```typescript
async function getLatestPosts(params: { afterCursor?: Cursor; count?: number }): Promise<PostWithUpdateTime[]>;
```

Fetches the latest post from each active channel and DM for sync purposes.

---

### `getChangedPosts`

```typescript
async function getChangedPosts(params: {
  channelId: string;
  startCursor: Cursor;
  endCursor: Cursor;
  afterTime: Date
}): Promise<GetChangedPostsResponse>;
```

Fetches posts that have changed within a time range for a group channel.

---

### `getPostWithReplies`

```typescript
async function getPostWithReplies(params: { postId: string; channelId: string; authorId: string }): Promise<db.Post>;
```

Fetches a single post along with all its replies.

---

### `getPostReference`

```typescript
async function getPostReference(params: { channelId: string; postId: string; replyId?: string }): Promise<db.Post>;
```

Fetches a post or reply reference for use in content citations.

---

### `getHiddenPosts`

```typescript
async function getHiddenPosts(): Promise<string[]>;
```

Fetches the list of hidden post IDs from group channels.

---

### `getHiddenDMPosts`

```typescript
async function getHiddenDMPosts(): Promise<string[]>;
```

Fetches the list of hidden message IDs from DMs and group DMs.

---

### `toContentReference`

```typescript
function toContentReference(cite: ub.Cite): ContentReference | null;
```

Converts an Urbit citation object to a client-side ContentReference.
