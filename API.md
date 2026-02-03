# @tloncorp/api

Standalone API client for Urbit ships.

## Installation

```bash
pnpm add @tloncorp/api
```

## Quick Start

### Using the High-Level API (Recommended)

The high-level API functions (`sendPost`, `getGroups`, `getCurrentUserId`, etc.) use an internal singleton client that must be configured first:

```typescript
import { configureClient, sendPost, getCurrentUserId, subscribeToChannelsUpdates } from '@tloncorp/api';

// Configure the internal client (required before using high-level API functions)
configureClient({
  shipName: '~zod',
  shipUrl: 'http://localhost:8080',
  getCode: async () => 'lidlut-tabwed-pillex-ridrup',
});

// Now you can use high-level API functions
const myShip = getCurrentUserId(); // '~zod'

await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: myShip,
  sentAt: Date.now(),
  content: [{ inline: ['Hello, world!'] }]
});

// Subscribe to real-time updates
await subscribeToChannelsUpdates((update) => {
  console.log('Channel update:', update);
});
```

### Using the Low-Level Urbit Class

For direct control, you can use the `Urbit` class directly:

```typescript
import { Urbit } from '@tloncorp/api';

// Create and connect to a ship
const client = new Urbit('http://localhost:8080', 'lidlut-tabwed-pillex-ridrup');
await client.connect();

// Scry for data
const pikes = await client.scry({ app: 'hood', path: '/kiln/pikes' });

// Poke an agent
await client.poke({ app: 'hood', mark: 'helm-hi', json: 'hello' });

// Subscribe to updates
client.subscribe({
    app: 'groups',
    path: '/groups',
    event: (data) => console.log('Update:', data),
    err: (err) => console.error('Error:', err),
    quit: () => console.log('Subscription ended'),
});
```

**Note:** The `Urbit` class and `configureClient` are separate. Creating a `new Urbit()` instance does NOT configure the singleton used by high-level functions. If you need both, configure the singleton separately.

---

## ID Formats

### User IDs

User IDs are Urbit ship names, always prefixed with `~`:

```typescript
const userId = '~sampel-palnet';  // Always include the ~
```

### Group IDs

Group IDs combine the host's ship name and group name:

```typescript
const groupId = '~sampel-palnet/my-group';
```

### Channel IDs

**Group channels** include the type, host, and name:
```typescript
const chatChannel = 'chat/~sampel-palnet/general';
const notebook = 'diary/~sampel-palnet/announcements';
const gallery = 'heap/~sampel-palnet/photos';
```

**DM channels** use the other user's ship name:
```typescript
const dmChannel = '~zod';
```

**Group DMs** use a generated identifier:
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

## Data Types

### Group

Represents a Tlon group with channels, members, and settings.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Group identifier (e.g., `~host/group-name`) |
| `title` | `string?` | Display name |
| `description` | `string?` | Group description |
| `iconImage` | `string?` | Icon image URL |
| `coverImage` | `string?` | Cover/banner image URL |
| `privacy` | `'public' \| 'private' \| 'secret'` | Visibility setting |
| `hostUserId` | `string` | Ship that hosts the group |
| `currentUserIsMember` | `boolean` | Whether you're a member |
| `currentUserIsHost` | `boolean` | Whether you're the host |
| `memberCount` | `number?` | Total member count |
| `lastPostAt` | `number?` | Timestamp of most recent post |
| `channels` | `Channel[]?` | Nested channels (if populated) |
| `members` | `ChatMember[]?` | Member list (if populated) |
| `roles` | `GroupRole[]?` | Custom roles |
| `navSections` | `GroupNavSection[]?` | Channel organization sections |

### Channel

Represents a chat, notebook, gallery, DM, or group DM.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Channel identifier |
| `type` | `'chat' \| 'notebook' \| 'gallery' \| 'dm' \| 'groupDm'` | Channel type |
| `groupId` | `string?` | Parent group (null for DMs) |
| `title` | `string?` | Display name |
| `description` | `string?` | Channel description |
| `iconImage` | `string?` | Icon image URL |
| `currentUserIsMember` | `boolean?` | Membership status |
| `postCount` | `number?` | Total post count |
| `unreadCount` | `number?` | Unread message count |
| `lastPostId` | `string?` | Most recent post ID |
| `lastPostAt` | `number?` | Most recent post timestamp |
| `members` | `ChatMember[]?` | Member list (for DMs/group DMs) |
| `isDmInvite` | `boolean?` | Whether this is a pending DM invite |

### Post

Represents a message, note, or gallery item.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Post identifier |
| `authorId` | `string` | Author's ship name |
| `channelId` | `string` | Channel where posted |
| `groupId` | `string?` | Parent group |
| `parentId` | `string?` | Parent post (for replies) |
| `type` | `'chat' \| 'note' \| 'block' \| 'reply' \| 'notice'` | Post type |
| `content` | `Story` | Rich content (see Message Content) |
| `textContent` | `string?` | Plain text extraction |
| `title` | `string?` | Title (notebooks/galleries) |
| `image` | `string?` | Featured image URL |
| `sentAt` | `number` | Send timestamp (Unix ms) |
| `receivedAt` | `number` | Receive timestamp |
| `replyCount` | `number?` | Number of replies |
| `replyTime` | `number?` | Most recent reply timestamp |
| `reactions` | `Reaction[]?` | Emoji reactions |
| `replies` | `Post[]?` | Nested replies (if populated) |
| `author` | `Contact?` | Author info (if populated) |
| `isEdited` | `boolean?` | Whether post was edited |
| `isDeleted` | `boolean?` | Whether post was deleted |
| `deliveryStatus` | `'pending' \| 'sent' \| 'failed'` | Send status |

### Contact

Represents a user profile.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Ship name (e.g., `~sampel-palnet`) |
| `nickname` | `string?` | Computed display name |
| `peerNickname` | `string?` | Name they set for themselves |
| `customNickname` | `string?` | Name you set for them |
| `avatarImage` | `string?` | Computed avatar URL |
| `bio` | `string?` | Profile biography |
| `status` | `string?` | Current status message |
| `color` | `string?` | Profile accent color |
| `coverImage` | `string?` | Profile banner image |
| `isBlocked` | `boolean?` | Whether blocked by you |
| `isContact` | `boolean?` | In your contact book |
| `attestations` | `Attestation[]?` | Verified identities |

### Reaction

| Field | Type | Description |
|-------|------|-------------|
| `contactId` | `string` | Who reacted |
| `postId` | `string` | Post that was reacted to |
| `value` | `string` | Emoji reaction |

---

## Message Content (Story)

Messages use the `Story` format - an array of content blocks:

```typescript
import type { Story } from '@tloncorp/api';

// Plain text
const text: Story = [{ inline: ['Hello, world!'] }];

// With mention
const mention: Story = [{ inline: ['Hello ', { ship: '~zod' }, '!'] }];

// With link
const link: Story = [{ inline: [{ link: { href: 'https://example.com', content: 'Click here' } }] }];

// With formatting
const formatted: Story = [{ inline: [{ bold: ['Important'] }, ' - ', { italics: ['note'] }] }];

// With image
const image: Story = [{ block: { image: { src: 'https://example.com/img.png', alt: 'desc', width: 800, height: 600 } } }];

// With code block
const code: Story = [{ block: { code: { code: 'const x = 1;', lang: 'typescript' } } }];
```

---

## Examples

### Connect and Send a Message

```typescript
import { configureClient, sendPost, getCurrentUserId } from '@tloncorp/api';

// Configure the internal client first
configureClient({
  shipName: '~zod',
  shipUrl: 'http://localhost:8080',
  getCode: async () => 'lidlut-tabwed-pillex-ridrup',
});

const myShip = getCurrentUserId(); // '~zod'

// Send a message with a mention
await sendPost({
  channelId: 'chat/~sampel-palnet/general',
  authorId: myShip,
  sentAt: Date.now(),
  content: [
    {
      inline: [
        'Hello ',
        { ship: '~sampel-palnet' },
        '! Check out ',
        { link: { href: 'https://example.com', content: 'this link' } }
      ]
    }
  ]
});
```

### Read and Paginate Channel History

```typescript
import { getChannelPosts, getPostWithReplies } from '@tloncorp/api';

// Get the 50 newest posts
const { posts, cursor } = await getChannelPosts({
  channelId: 'chat/~sampel-palnet/general',
  count: 50,
  mode: 'newest'
});

console.log(`Loaded ${posts.length} posts`);

// Load older posts (pagination)
if (cursor) {
  const { posts: olderPosts, cursor: nextCursor } = await getChannelPosts({
    channelId: 'chat/~sampel-palnet/general',
    count: 50,
    cursor,
    mode: 'older'
  });
}

// Get a specific post with all its replies
const postWithReplies = await getPostWithReplies({
  postId: posts[0].id,
  channelId: posts[0].channelId,
  authorId: posts[0].authorId
});

console.log(`Post has ${postWithReplies.replyCount} replies`);
```

### Subscribe to Real-Time Updates

```typescript
import { subscribeToChannelsUpdates, subscribeToActivity, unsubscribe } from '@tloncorp/api';

// Assumes configureClient was already called

// Listen for new messages, edits, and deletions
await subscribeToChannelsUpdates((update) => {
  switch (update.type) {
    case 'post':
      console.log('New post in', update.channelId, ':', update.post);
      break;
    case 'reply':
      console.log('New reply to', update.parentId, ':', update.reply);
      break;
    case 'edit':
      console.log('Post edited:', update.postId);
      break;
    case 'delete':
      console.log('Post deleted:', update.postId);
      break;
  }
});

// Listen for activity (mentions, replies to your posts)
await subscribeToActivity((event) => {
  if (event.isMention) {
    console.log('You were mentioned in', event.channelId);
  }
});

// For low-level subscriptions using the Urbit class, you can unsubscribe by ID:
// const subId = await client.subscribe({ app: 'groups', path: '/groups', ... });
// await unsubscribe(subId);  // Cancel the subscription
```

### Create a Group with Channels

```typescript
import { createGroup, addChannelToGroup, inviteGroupMembers, getCurrentUserId } from '@tloncorp/api';

// Assumes configureClient was already called
const myShip = getCurrentUserId();

// Create the group (id is auto-generated by the backend, pass empty string)
const group = await createGroup({
  group: {
    id: '',  // Auto-generated - will be returned as '~your-ship/group-name'
    title: 'My Community',
    description: 'A place for discussion',
    privacy: 'private',
    currentUserIsMember: true,
    currentUserIsHost: true,
    hostUserId: myShip
  }
});

console.log('Created group:', group.id); // e.g., '~zod/my-community'

// Add a chat channel
await addChannelToGroup({
  groupId: group.id,
  channelId: `chat/${myShip}/general`,
  sectionId: 'default'
});

// Invite members
await inviteGroupMembers({
  groupId: group.id,
  contactIds: ['~sampel-palnet', '~littel-wolfur']
});
```

### Send a DM

```typescript
import { sendPost, getCurrentUserId } from '@tloncorp/api';

// Assumes configureClient was already called
const myShip = getCurrentUserId();

// DM channel ID is just the other user's ship name
await sendPost({
  channelId: '~sampel-palnet',
  authorId: myShip,
  sentAt: Date.now(),
  content: [{ inline: ['Hey, how are you?'] }]
});
```

---

## Error Handling

```typescript
import {
  configureClient,
  sendPost,
  BadResponseError,
  TimeoutError,
  AuthError
} from '@tloncorp/api';

try {
  // Configure the client
  configureClient({
    shipName: '~zod',
    shipUrl: 'http://localhost:8080',
    getCode: async () => 'your-code',
    handleAuthFailure: () => console.error('Authentication failed'),
  });

  // Send a post
  await sendPost({
    channelId: 'chat/~sampel-palnet/general',
    authorId: '~zod',
    sentAt: Date.now(),
    content: [{ inline: ['Hello!'] }]
  });
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Invalid access code');
  } else if (error instanceof BadResponseError) {
    console.error(`HTTP ${error.status}: ${error.body}`);
    // Common statuses: 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)
  } else if (error instanceof TimeoutError) {
    console.error(`Timeout after ${error.timeoutDuration}ms`);
    // May be worth retrying
  }
}
```

---

## Core Client

### `Urbit` Class

The main HTTP client class for connecting to Urbit ships.

```typescript
const client = new Urbit(url: string, code?: string);
```

**Methods:**

-   `connect()` - Authenticate and establish connection
-   `poke<T>(params)` - Send a poke to a Gall agent
-   `scry<T>(params)` - Scry data from an agent
-   `subscribe(params)` - Subscribe to a path for updates
-   `subscribeOnce<T>(app, path)` - One-time subscription
-   `unsubscribe(id)` - Unsubscribe from a subscription
-   `thread<T>(params)` - Run a spider thread
-   `reset()` - Reset connection and clear subscriptions

---

### Error Classes

#### `BadResponseError`

```typescript
class BadResponseError extends Error {
    status: number;
    body: string;
    constructor(status: number, body: string);
}
```

Custom error thrown when an HTTP request returns a non-successful response. Contains the HTTP status code and response body for debugging.

#### `TimeoutError`

```typescript
class TimeoutError extends Error {
    connectionStatus: string;
    timeoutDuration: number | null;
    constructor(options: { connectionStatus?: string; timeoutDuration?: number });
}
```

Custom error thrown when an operation times out. Contains diagnostic information about the connection status and configured timeout duration.

#### `AuthError`

```typescript
class AuthError extends Error {}
```

Custom error thrown when authentication fails, typically due to an invalid access code or expired session.

---

### Client Functions

#### `poke`

```typescript
async function poke(params: PokeParams): Promise<number>;
```

**Parameters:**

-   `params.app: string` - The target application name
-   `params.mark: string` - The mark (type) of the poke data
-   `params.json: any` - The JSON payload to send

**Returns:** The poke ID

Sends a JSON poke (command) to an Urbit application. Automatically handles re-authentication if the session has expired.

---

#### `pokeNoun`

```typescript
async function pokeNoun<T>(params: NounPokeParams): Promise<number | undefined>;
```

**Parameters:**

-   `params.app: string` - The target application name
-   `params.mark: string` - The mark (type) of the poke data
-   `params.noun: Noun` - The noun (binary) payload to send

**Returns:** The poke ID

Sends a noun (binary/Nock) poke to an Urbit application. Uses noun format instead of JSON for more efficient data transfer.

---

#### `scry`

```typescript
async function scry<T>(params: { app: string; path: string; timeout?: number }): Promise<T>;
```

**Parameters:**

-   `params.app: string` - The application to scry from
-   `params.path: string` - The scry path
-   `params.timeout?: number` - Optional timeout in milliseconds (default: 60000)

**Returns:** The scry result parsed as JSON

Performs a synchronous read (scry) from an Urbit application's state. Throws `BadResponseError` on failure.

---

#### `scryNoun`

```typescript
async function scryNoun(params: { app: string; path: string; timeout?: number }): Promise<Noun>;
```

Performs a synchronous read (scry) returning the result in noun (binary/Nock) format. Useful for data more efficient in binary form.

---

#### `subscribe`

```typescript
async function subscribe<T>(endpoint: { app: string; path: string }, handler: (update: T, id?: number) => void): Promise<number>;
```

**Returns:** The subscription ID

Creates a persistent subscription to an Urbit application path. The handler is called for each event received. Handles quit events and re-authentication automatically.

---

#### `subscribeOnce`

```typescript
async function subscribeOnce<T>(endpoint: { app: string; path: string }, timeout?: number, ship?: string, requestConfig?: { tag?: string }): Promise<T>;
```

**Returns:** The first event received on the subscription

Creates a one-shot subscription that resolves with the first event received and then automatically unsubscribes. Useful for request-response patterns.

---

#### `unsubscribe`

```typescript
async function unsubscribe(id: number): Promise<void>;
```

Cancels an active subscription by its ID.

---

#### `thread`

```typescript
async function thread<T, R = any>(params: { desk: string; threadName: string; inputMark: string; outputMark: string; body: T; timeout?: number }): Promise<R>;
```

Executes an Urbit thread (a one-off computation) and returns the result. Threads are useful for operations that shouldn't be part of permanent state.

---

#### `request`

```typescript
async function request<T>(path: string, options?: RequestInit, timeout?: number): Promise<T>;
```

Makes a raw HTTP request through the Urbit client. Provides low-level access for custom endpoints.

---

#### `getCurrentUserId`

```typescript
function getCurrentUserId(): string;
```

Returns the node ID (ship name with sigil) of the currently authenticated user.

---

#### `getCurrentUserIsHosted`

```typescript
function getCurrentUserIsHosted(): boolean;
```

Returns whether the current user's ship is running on Tlon's hosted infrastructure.

---

#### `configureClient`

```typescript
function configureClient(params: ClientParams): void;
```

**Parameters:**

-   `params.shipName: string` - The ship's name (e.g., '~zod')
-   `params.shipUrl: string` - The ship's URL (e.g., 'http://localhost:8080')
-   `params.verbose?: boolean` - Enable verbose logging
-   `params.fetchFn?: typeof fetch` - Custom fetch implementation
-   `params.getCode?: () => Promise<string>` - Function to retrieve auth code for re-authentication
-   `params.handleAuthFailure?: () => void` - Callback for auth failures
-   `params.onQuitOrReset?: (cause) => void` - Callback for connection issues
-   `params.onChannelStatusChange?: (status) => void` - Callback for status changes

**IMPORTANT:** This function configures the internal singleton client used by all high-level API functions (`sendPost`, `getGroups`, `getCurrentUserId`, `subscribeToChannelsUpdates`, etc.). You must call this before using those functions.

**Note:** Creating a `new Urbit()` instance does NOT configure the singleton. Use `configureClient` for high-level API functions, or use the `Urbit` class directly for low-level operations.

```typescript
import { configureClient, sendPost, getCurrentUserId } from '@tloncorp/api';

// This is REQUIRED before using sendPost, getCurrentUserId, etc.
configureClient({
  shipName: '~zod',
  shipUrl: 'http://localhost:8080',
  getCode: async () => 'lidlut-tabwed-pillex-ridrup',
});

// Now these work:
const myShip = getCurrentUserId();
await sendPost({ channelId, authorId: myShip, sentAt: Date.now(), content: [...] });
```

---

#### `checkIsNodeBusy`

```typescript
async function checkIsNodeBusy(): Promise<'available' | 'busy' | 'unknown'>;
```

Checks whether the Urbit node is currently busy processing requests.

---

## Initialization

#### `getInitData`

```typescript
async function getInitData(): Promise<InitData>;
```

Fetches all initial application data in a single request for app startup.

**Response Data:** `InitData` object containing:
- `groups` - Array of `Group` objects the user belongs to
- `channels` - Array of `Channel` objects (group channels, DMs, group DMs)
- `unreads` - `ActivityInit` with unread counts per group/channel/thread
- `pins` - Array of `Pin` objects (pinned groups, channels, DMs)
- `hiddenPosts` - Array of hidden post IDs
- `blockedUsers` - Array of blocked user IDs

---

## Groups API

### CRUD Operations

#### `createGroup`

```typescript
async function createGroup(params: { group: db.Group; memberIds?: string[]; placeHolderTitle?: string }): Promise<db.Group>;
```

Creates a new group with the specified metadata and optionally invites initial members. Returns the newly created group.

---

#### `getGroup`

```typescript
async function getGroup(groupId: string): Promise<db.Group>;
```

Retrieves a single group by its ID via a scry request.

**Response Data:** Single `Group` object (see `getGroups` for field descriptions).

---

#### `getGroups`

```typescript
async function getGroups(): Promise<db.Group[]>;
```

Retrieves all groups the current user has joined.

**Response Data:** Array of `Group` objects containing:
- `id` - Group identifier (e.g., `~sampel-palnet/my-group`)
- `title` - Display name of the group
- `description` - Group description text
- `iconImage` / `coverImage` - Image URLs for group branding
- `privacy` - `'public'` | `'private'` | `'secret'`
- `hostUserId` - Ship that hosts the group
- `currentUserIsMember` / `currentUserIsHost` - Membership flags
- `memberCount` - Number of members (if available)
- `lastPostAt` - Timestamp of most recent post
- `channels` - Array of `Channel` objects (if populated)
- `members` - Array of `ChatMember` objects (if populated)
- `roles` - Array of `GroupRole` objects (if populated)
- `navSections` - Navigation sections for organizing channels

---

#### `updateGroupMeta`

```typescript
async function updateGroupMeta(params: { groupId: string; meta: ub.GroupMeta }): Promise<void>;
```

Updates a group's metadata (title, description, image, cover). Uses a tracked poke to wait for confirmation.

---

#### `deleteGroup`

```typescript
async function deleteGroup(groupId: string): Promise<void>;
```

Permanently deletes a group.

---

#### `updateGroupPrivacy`

```typescript
async function updateGroupPrivacy(params: { groupId: string; oldPrivacy: GroupPrivacy; newPrivacy: GroupPrivacy }): Promise<void>;
```

Changes a group's privacy setting between 'public', 'private', and 'secret'.

---

### Membership Management

#### `inviteGroupMembers`

```typescript
async function inviteGroupMembers(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Sends invitations to the specified users to join a group.

---

#### `acceptGroupJoin`

```typescript
async function acceptGroupJoin(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Approves pending join requests from the specified users.

---

#### `rejectGroupJoin`

```typescript
async function rejectGroupJoin(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Denies pending join requests from the specified users.

---

#### `cancelGroupJoin`

```typescript
async function cancelGroupJoin(groupId: string): Promise<void>;
```

Cancels the current user's pending join request for a group.

---

#### `leaveGroup`

```typescript
async function leaveGroup(groupId: string): Promise<void>;
```

Removes the current user from a group.

---

#### `requestGroupInvitation`

```typescript
async function requestGroupInvitation(groupId: string): Promise<void>;
```

Sends a join request ("knock") to a private group.

---

#### `rescindGroupInvitationRequest`

```typescript
async function rescindGroupInvitationRequest(groupId: string): Promise<void>;
```

Withdraws a previously sent join request for a group.

---

#### `kickUsersFromGroup`

```typescript
async function kickUsersFromGroup(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Removes the specified users from a group without banning them.

---

#### `banUsersFromGroup`

```typescript
async function banUsersFromGroup(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Bans the specified users from a group, preventing them from rejoining.

---

#### `unbanUsersFromGroup`

```typescript
async function unbanUsersFromGroup(params: { groupId: string; contactIds: string[] }): Promise<void>;
```

Removes a ban on the specified users.

---

### Role Management

#### `addGroupRole`

```typescript
async function addGroupRole(params: { groupId: string; roleId: string; meta: db.ClientMeta }): Promise<void>;
```

Creates a new role in a group with the specified ID and metadata.

---

#### `updateGroupRole`

```typescript
async function updateGroupRole(params: { groupId: string; roleId: string; meta: db.ClientMeta }): Promise<void>;
```

Updates an existing role's metadata in a group.

---

#### `deleteGroupRole`

```typescript
async function deleteGroupRole(params: { groupId: string; roleId: string }): Promise<void>;
```

Removes a role from a group.

---

#### `addMembersToRole`

```typescript
async function addMembersToRole(params: { groupId: string; roleId: string; ships: string[] }): Promise<void>;
```

Assigns a role to the specified group members.

---

#### `removeMembersFromRole`

```typescript
async function removeMembersFromRole(params: { groupId: string; roleId: string; ships: string[] }): Promise<void>;
```

Removes a role from the specified group members.

---

### Navigation Section Management

#### `addNavSection`

```typescript
async function addNavSection(params: { groupId: string; navSection: db.GroupNavSection }): Promise<void>;
```

Creates a new navigation section (zone) in a group for organizing channels.

---

#### `updateNavSection`

```typescript
async function updateNavSection(params: { groupId: string; navSection: db.GroupNavSection }): Promise<void>;
```

Updates an existing navigation section's metadata.

---

#### `deleteNavSection`

```typescript
async function deleteNavSection(params: { sectionId: string; groupId: string }): Promise<void>;
```

Removes a navigation section from a group.

---

#### `addChannelToNavSection`

```typescript
async function addChannelToNavSection(params: { groupId: string; navSectionId: string; channelId: string }): Promise<void>;
```

Moves or assigns a channel to a specific navigation section.

---

#### `updateGroupNavigation`

```typescript
async function updateGroupNavigation(params: { groupId: string; navSections: db.GroupNavSection[] }): Promise<void>;
```

Performs a batch update of all navigation sections and their channel orderings.

---

### Channel Management in Groups

#### `addChannelToGroup`

```typescript
async function addChannelToGroup(params: { channelId: string; groupId: string; sectionId: string }): Promise<void>;
```

Adds a channel to a group and places it in the specified navigation section.

---

#### `updateChannel`

```typescript
async function updateChannel(params: { groupId: string; channelId: string; channel: GroupChannelV7 }): Promise<void>;
```

Updates a channel's configuration including metadata and reader permissions.

---

#### `deleteChannel`

```typescript
async function deleteChannel(params: { groupId: string; channelId: string }): Promise<void>;
```

Removes a channel from a group. All channel content will be deleted.

---

### Pins and Previews

#### `getPinnedItems`

```typescript
async function getPinnedItems(): Promise<db.Pin[]>;
```

Retrieves the current user's pinned items (groups, channels, DMs, group DMs).

**Response Data:** Array of `Pin` objects containing:
- `type` - `'group'` | `'channel'` | `'dm'` | `'groupDm'`
- `itemId` - ID of the pinned item
- `index` - Display order position

---

#### `pinItem`

```typescript
async function pinItem(itemId: string): Promise<void>;
```

Adds an item to the user's pinned items list.

---

#### `unpinItem`

```typescript
async function unpinItem(itemId: string): Promise<void>;
```

Removes an item from the user's pinned items list.

---

#### `getGroupPreview`

```typescript
async function getGroupPreview(groupId: string): Promise<db.Group>;
```

Retrieves preview information about a group without joining it.

---

#### `getChannelPreview`

```typescript
async function getChannelPreview(channelId: string): Promise<db.Channel | null>;
```

Retrieves preview information about a channel without joining its group. Returns null if not accessible.

---

#### `findGroupsHostedBy`

```typescript
async function findGroupsHostedBy(userId: string): Promise<db.Group[]>;
```

Discovers all groups hosted by a specific user that the current user can see.

---

## Channels API

### Channel Creation

#### `createChannel`

```typescript
async function createChannel(params: ub.Create & { id: string }): Promise<void>;
```

**Parameters:**

-   `id: string` - The channel identifier
-   `kind: string` - Channel type (chat, diary, heap)
-   `group: string` - The group to create the channel in
-   `name: string` - Channel name
-   `title: string` - Display title
-   `description: string` - Channel description
-   `readers: string[]` - Roles that can read
-   `writers: string[]` - Roles that can write

Creates a new channel by sending a tracked poke to the channels agent.

---

#### `updateChannelMeta`

```typescript
async function updateChannelMeta(channelId: string, metaPayload: Stringified<ub.ChannelMetadataSchemaV1> | null): Promise<void>;
```

Updates the metadata for an existing channel.

---

#### `setupChannelFromTemplate`

```typescript
async function setupChannelFromTemplate(exampleChannelId: string, targetChannelId: string): Promise<any>;
```

Configures a target channel using another channel as a template. Copies hook configuration from the example channel.

---

#### `createNewGroupDefaultChannel`

```typescript
async function createNewGroupDefaultChannel(params: { groupId: string; currentUserId: string }): Promise<void>;
```

Creates a new default "Welcome" chat channel for a group with a randomized name suffix.

---

### Channel Membership

#### `joinChannel`

```typescript
async function joinChannel(channelId: string, groupId: string): Promise<void>;
```

Joins an existing channel within a group.

---

#### `leaveChannel`

```typescript
async function leaveChannel(channelId: string): Promise<void>;
```

Leaves an existing channel.

---

#### `addChannelWriters`

```typescript
async function addChannelWriters(params: { channelId: string; writers: string[] }): Promise<void>;
```

Adds ships as writers to a channel, granting them permission to post content.

---

#### `removeChannelWriters`

```typescript
async function removeChannelWriters(params: { channelId: string; writers: string[] }): Promise<void>;
```

Removes ships as writers from a channel.

---

### Channel Data

#### `searchChannel`

```typescript
async function searchChannel(params: { channelId: string; query: string; cursor?: string }): Promise<{ posts: db.Post[]; cursor: string }>;
```

Searches for posts matching a text query within a channel. Returns paginated results.

**Response Data:** `{ posts: Post[], cursor: string }` - matching posts and pagination cursor.

---

#### `getChannelHooksPreview`

```typescript
async function getChannelHooksPreview(channelId: string): Promise<ub.ChannelHooksPreview>;
```

Retrieves a preview of the hooks configured for a channel.

---

#### `setOrder`

```typescript
async function setOrder(channelId: string, arrangedPostIds: string[]): Promise<void>;
```

Sets the display order of posts within a channel. Used for channels that support manual arrangement.

---

#### `subscribeToChannelsUpdates`

```typescript
async function subscribeToChannelsUpdates(eventHandler: (update: ChannelsUpdate) => void): Promise<void>;
```

Subscribes to real-time channel updates including post additions, deletions, reactions, and channel lifecycle events.

---

## Posts & Messages API

### Post Creation

#### `sendPost`

```typescript
async function sendPost(params: { channelId: string; authorId: string; sentAt: number; content: Story; blob?: string; metadata?: db.PostMetadata }): Promise<void>;
```

Sends a new post to a channel (group channel, DM, or group DM).

---

#### `sendReply`

```typescript
async function sendReply(params: { authorId: string; channelId: string; parentId: string; parentAuthor: string; content: Story; sentAt: number }): Promise<void>;
```

Sends a reply to an existing post in a channel.

---

#### `editPost`

```typescript
async function editPost(params: { channelId: string; postId: string; authorId: string; sentAt: number; content: Story; parentId?: string; metadata?: db.PostMetadata; blob?: string }): Promise<void>;
```

Edits an existing post or reply in a group channel. Note: Editing is not supported for DMs or group DMs.

---

#### `deletePost`

```typescript
async function deletePost(channelId: string, postId: string, authorId: string): Promise<void>;
```

Deletes a top-level post from a channel.

---

#### `deleteReply`

```typescript
async function deleteReply(params: { channelId: string; parentId: string; parentAuthorId: string; postId: string; authorId: string }): Promise<void>;
```

Deletes a reply to a post.

---

### Post Visibility

#### `hidePost`

```typescript
async function hidePost(post: db.Post): Promise<void>;
```

Hides a post from the user's view.

---

#### `showPost`

```typescript
async function showPost(post: db.Post): Promise<void>;
```

Unhides a previously hidden post.

---

#### `reportPost`

```typescript
async function reportPost(currentUserId: string, groupId: string, channelId: string, post: db.Post): Promise<void>;
```

Reports a post for moderation and automatically hides it.

---

### Reactions

#### `addReaction`

```typescript
async function addReaction(params: { channelId: string; postId: string; emoji: string; our: string; postAuthor: string; parentAuthorId?: string; parentId?: string }): Promise<void>;
```

Adds an emoji reaction to a post or reply.

---

#### `removeReaction`

```typescript
async function removeReaction(params: { channelId: string; postId: string; our: string; postAuthor: string; parentId?: string; parentAuthorId?: string }): Promise<void>;
```

Removes the current user's reaction from a post or reply.

---

### Fetching Posts

#### `getChannelPosts`

```typescript
async function getChannelPosts(params: { channelId: string; cursor?: Cursor; mode?: 'older' | 'newer' | 'around' | 'newest'; count?: number; includeReplies?: boolean; sequenceBoundary?: number | null }): Promise<GetChannelPostsResponse>;
```

Fetches a paginated list of posts from a channel with cursor-based navigation.

**Response Data:** `{ posts: Post[], cursor?: Cursor }` where each `Post` contains:
- `id` - Unique post identifier
- `authorId` - Ship that authored the post (e.g., `~sampel-palnet`)
- `channelId` - Channel where the post was sent
- `groupId` - Group the channel belongs to (if applicable)
- `type` - `'chat'` | `'note'` | `'block'` | `'reply'` | `'notice'`
- `content` - Story content (array of inline/block elements)
- `textContent` - Plain text extraction of content
- `sentAt` - Timestamp when sent (Unix ms)
- `receivedAt` - Timestamp when received
- `title` / `image` / `description` - Metadata for notebooks/galleries
- `replyCount` - Number of replies to this post
- `replyTime` - Timestamp of most recent reply
- `replyContactIds` - Array of user IDs who replied
- `reactions` - Array of `{ contactId, postId, value }` emoji reactions
- `replies` - Array of reply `Post` objects (if `includeReplies: true`)
- `author` - `Contact` object for the author (if populated)
- `hasImage` / `hasLink` / `hasAppReference` - Content type flags
- `isEdited` / `isDeleted` - Edit state flags
- `deliveryStatus` - `'pending'` | `'sent'` | `'failed'` etc.

---

#### `getInitialPosts`

```typescript
async function getInitialPosts(config: { channelCount: number; postCount: number }): Promise<db.Post[]>;
```

Fetches initial posts from multiple channels at once for app initialization.

---

#### `getLatestPosts`

```typescript
async function getLatestPosts(params: { afterCursor?: Cursor; count?: number }): Promise<PostWithUpdateTime[]>;
```

Fetches the latest post from each active channel and DM for sync purposes.

---

#### `getChangedPosts`

```typescript
async function getChangedPosts(params: { channelId: string; startCursor: Cursor; endCursor: Cursor; afterTime: Date }): Promise<GetChangedPostsResponse>;
```

Fetches posts that have changed within a time range for a group channel.

---

#### `getPostWithReplies`

```typescript
async function getPostWithReplies(params: { postId: string; channelId: string; authorId: string }): Promise<db.Post>;
```

Fetches a single post along with all its replies.

**Response Data:** Single `Post` object with `replies` array populated (see `getChannelPosts` for field descriptions).

---

#### `getPostReference`

```typescript
async function getPostReference(params: { channelId: string; postId: string; replyId?: string }): Promise<db.Post>;
```

Fetches a post or reply reference for use in content citations.

---

#### `getHiddenPosts`

```typescript
async function getHiddenPosts(): Promise<string[]>;
```

Fetches the list of hidden post IDs from group channels.

---

#### `getHiddenDMPosts`

```typescript
async function getHiddenDMPosts(): Promise<string[]>;
```

Fetches the list of hidden message IDs from DMs and group DMs.

---

#### `toContentReference`

```typescript
function toContentReference(cite: ub.Cite): ContentReference | null;
```

Converts an Urbit citation object to a client-side ContentReference. Returns null for invalid citations.

---

## Direct Messages API

#### `markChatRead`

```typescript
async function markChatRead(whom: string): Promise<void>;
```

Marks all messages in a chat (DM or channel) as read.

---

#### `createGroupDm`

```typescript
async function createGroupDm(params: { id: string; members: string[] }): Promise<void>;
```

Creates a new group DM (multi-person direct message) with the specified ID and member list.

---

#### `respondToDMInvite`

```typescript
async function respondToDMInvite(params: { channel: db.Channel; accept: boolean }): Promise<void>;
```

Accepts or declines a DM invitation, handling both regular DMs and group DMs.

---

#### `updateDMMeta`

```typescript
async function updateDMMeta(params: { channelId: string; meta: db.ClientMeta }): Promise<void>;
```

Updates the metadata (title, description, images) of a group DM channel.

---

## Contacts API

#### `getContacts`

```typescript
async function getContacts(): Promise<db.Contact[]>;
```

Fetches all contacts by combining peer profiles, contact book entries, and contact suggestions.

**Response Data:** Array of `Contact` objects containing:
- `id` - Ship name (e.g., `~sampel-palnet`)
- `nickname` - Display name (computed from peer or custom nickname)
- `peerNickname` - Nickname set by the contact themselves
- `customNickname` - Nickname you've set for this contact
- `avatarImage` - Profile image URL (computed)
- `peerAvatarImage` / `customAvatarImage` - Source avatar URLs
- `bio` - Profile biography text
- `status` - Current status message
- `color` - Profile accent color
- `coverImage` - Profile cover/banner image
- `isBlocked` - Whether you've blocked this contact
- `isContact` - Whether they're in your contact book
- `isContactSuggestion` - Whether this is a suggested contact
- `attestations` - Array of verified identity attestations (phone, etc.)

---

#### `updateContactMetadata`

```typescript
async function updateContactMetadata(contactId: string, metadata: { nickname?: string; avatarImage?: string }): Promise<void>;
```

Updates a contact's custom nickname and/or avatar image override.

---

#### `removeContactSuggestion`

```typescript
async function removeContactSuggestion(contactId: string): Promise<void>;
```

Hides a suggested contact from the suggestions list.

---

#### `addContactSuggestions`

```typescript
async function addContactSuggestions(contactIds: string[]): Promise<void>;
```

Adds multiple contacts to the suggestions list.

---

#### `syncUserProfiles`

```typescript
async function syncUserProfiles(userIds: string[]): Promise<void>;
```

Triggers profile sync for a list of users, fetching their latest profile data.

---

## Activity & Unreads API

#### `getGroupAndChannelUnreads`

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

#### `getThreadUnreadsByChannel`

```typescript
async function getThreadUnreadsByChannel(channel: db.Channel): Promise<db.ThreadUnreadState[]>;
```

Retrieves thread-level unread states for a specific channel.

---

#### `getVolumeSettings`

```typescript
async function getVolumeSettings(): Promise<ub.VolumeSettings>;
```

Fetches the current notification volume settings.

---

#### `getInitialActivity`

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
- `relevantUnreads` - `ActivityInit` object (see `getGroupAndChannelUnreads`)

---

#### `getPagedActivityByBucket`

```typescript
async function getPagedActivityByBucket(params: { cursor: number; bucket: db.ActivityBucket }): Promise<{
    events: db.ActivityEvent[];
    nextCursor: number | null;
    relevantUnreads: db.ActivityInit;
}>;
```

Fetches a page of activity events for a specific bucket with cursor-based pagination.

---

#### `subscribeToActivity`

```typescript
function subscribeToActivity(handler: (event: ActivityEvent) => void): void;
```

Subscribes to real-time activity updates including unread changes and new events.

---

#### `ACTIVITY_SOURCE_PAGESIZE`

```typescript
const ACTIVITY_SOURCE_PAGESIZE: number = 30;
```

The default page size for activity queries.

---

## Settings API

#### `getSettings`

```typescript
async function getSettings(): Promise<{
    settings: db.Settings;
    pendingMemberDismissals: db.PendingMemberDismissals;
}>;
```

Fetches all user settings including theme, display preferences, and dismissal states.

---

#### `setSetting`

```typescript
async function setSetting(key: string, val: any): Promise<void>;
```

Updates a single setting value, automatically routing to the appropriate settings bucket.

---

#### `subscribeToSettings`

```typescript
function subscribeToSettings(handler: (update: SettingsUpdate) => void): void;
```

Subscribes to real-time settings changes.

---

#### `getAppInfo`

```typescript
async function getAppInfo(): Promise<Partial<db.AppInfo>>;
```

Fetches application metadata including groups desk version, hash, and sync node.

---

## Storage API

#### `getStorageConfiguration`

```typescript
async function getStorageConfiguration(): Promise<StorageConfiguration>;
```

Retrieves the current S3-compatible storage configuration.

---

#### `getStorageCredentials`

```typescript
async function getStorageCredentials(): Promise<StorageCredentials>;
```

Fetches the current storage credentials for file uploads.

---

#### `subscribeToStorageUpdates`

```typescript
async function subscribeToStorageUpdates(eventHandler: (update: StorageUpdate) => void): Promise<void>;
```

Subscribes to storage configuration changes.

---

## Connection Status API

#### `getLastConnectionStatus`

```typescript
async function getLastConnectionStatus(contactId: string): Promise<ConnectionStatus>;
```

Retrieves the last known connection status for a specific ship/contact.

---

#### `checkConnectionStatus`

```typescript
async function checkConnectionStatus(contactId: string, callback: (data: ConnectionStatus) => boolean): Promise<subscription>;
```

Initiates a connection check to a ship and subscribes to status updates.

---

## Invites API

#### `createInviteLink`

```typescript
async function createInviteLink(token: string, metadata: { tag: string; fields: Record<string, string | undefined> }): Promise<void>;
```

Creates an invite link with associated metadata on the reel provider.

---

#### `enableGroup`

```typescript
async function enableGroup(name: string): Promise<void>;
```

Enables a group for invite link functionality.

---

#### `createPersonalInviteLink`

```typescript
async function createPersonalInviteLink(currentUser?: db.Contact | null): Promise<string>;
```

Creates a personal invite link that allows others to add the current user as a contact. Returns the tlon.network URL.

---

#### `checkExistingUserInviteLink`

```typescript
async function checkExistingUserInviteLink(): Promise<string | null>;
```

Checks if a personal invite link already exists for the current user. Returns the URL if found or null.

---

## Attestations (Lanyard) API

#### `subscribeToLanyardUpdates`

```typescript
function subscribeToLanyardUpdates(eventHandler: (event: LanyardUpdate) => void): void;
```

Subscribes to lanyard record updates for real-time attestation status changes.

---

#### `checkAttestedSignature`

```typescript
async function checkAttestedSignature(signData: string): Promise<boolean>;
```

Verifies an attestation signature is valid and live.

---

#### `discoverContacts`

```typescript
async function discoverContacts(phoneNums: string[], storedLastSalt: string | null, lastPhoneNumberSetSent: string | null): Promise<{ matches: [string, string][]; nextSalt: string | null }>;
```

Performs contact discovery by sending hashed phone numbers to find matching Urbit users.

---

## Link Metadata API

#### `getLinkMetadata`

```typescript
async function getLinkMetadata(url: string): Promise<domain.LinkMetadata | domain.LinkMetadataError>;
```

Fetches link preview metadata (title, description, image) for a URL via the ship's metagrab endpoint.

---

#### `getFallbackLinkMetadata`

```typescript
async function getFallbackLinkMetadata(url: string): Promise<domain.LinkMetadata | domain.LinkMetadataError>;
```

Fetches link preview metadata using the external invite service as a fallback.

---

## Data Sync API

#### `fetchChangesSince`

```typescript
async function fetchChangesSince(timestamp: number): Promise<
    db.ChangesResult & {
        nodeBusyStatus: 'available' | 'busy' | 'unknown';
        hints?: string;
    }
>;
```

Fetches all data changes (groups, posts, contacts, unreads) since a given timestamp for incremental sync.

---

## Hosting API

#### `HostingError`

```typescript
class HostingError extends Error {
    status: number;
    method: string;
    path: string;
    responseText?: string;
}
```

Custom error class for hosting API errors with detailed diagnostic information.

---

#### `getReservableShips`

```typescript
async function getReservableShips(user: string): Promise<ReservableShip[]>;
```

Fetches the list of ships available for reservation by a hosting user.

---

#### `reserveShip`

```typescript
async function reserveShip(userId: string, ship: string): Promise<ReservedShip>;
```

Reserves a specific ship name for a hosting user before allocation.

---

#### `allocateReservedShip`

```typescript
async function allocateReservedShip(user: string): Promise<object>;
```

Allocates a previously reserved ship to the user, initiating the ship boot process.

---

#### `getShipAccessCode`

```typescript
async function getShipAccessCode(shipId: string): Promise<{ code: string }>;
```

Retrieves the network access code (password) for a hosted ship.

---

#### `resumeShip`

```typescript
async function resumeShip(shipId: string): Promise<object>;
```

Resumes a suspended/paused hosted ship.

---

#### `getShip`

```typescript
async function getShip(shipId: string): Promise<HostedShipResponse>;
```

Fetches detailed status information about a hosted ship.

---

#### `checkPhoneVerify`

```typescript
async function checkPhoneVerify(userId: string, code: string): Promise<object>;
```

Verifies a phone number verification code for a hosting user.

---

#### `requestPhoneVerify`

```typescript
async function requestPhoneVerify(userId: string, phoneNumber: string): Promise<object>;
```

Requests a phone verification code be sent to the specified number.

---

#### `getHostingAvailability`

```typescript
async function getHostingAvailability(params: { email?: string; lure?: string; priorityToken?: string }): Promise<{ enabled: boolean; validEmail: boolean }>;
```

Checks if hosting signup is available and validates the provided email.

---

#### `getHostingHeartBeat`

```typescript
async function getHostingHeartBeat(): Promise<'expired' | 'ok' | 'unknown'>;
```

Checks if the hosting authentication session is still valid.

---

## AI Summarization API

#### `summarizeMessage`

```typescript
async function summarizeMessage(params: { messageText: string }): Promise<SummarizeMessageResponse>;
```

Summarizes a conversation using OpenRouter's AI API. Returns a structured summary with topic, key points, and action items.

---

## Authentication API

#### `getLandscapeAuthCookie`

```typescript
async function getLandscapeAuthCookie(shipUrl: string, accessCode: string): Promise<string | undefined>;
```

Authenticates with a ship's web interface and returns the session cookie.

---

## Utility Functions

#### `udToDate`

```typescript
function udToDate(das: string): number;
```

Converts an Urbit @ud or @da formatted timestamp string to a Unix timestamp in milliseconds.

---

#### `isDmChannelId`

```typescript
function isDmChannelId(channelId: string): boolean;
```

Checks if a channel ID represents a direct message (starts with ~).

---

#### `isGroupDmChannelId`

```typescript
function isGroupDmChannelId(channelId: string): boolean;
```

Checks if a channel ID represents a group DM/club (starts with 0v).

---

#### `isGroupChannelId`

```typescript
function isGroupChannelId(channelId: string): boolean;
```

Checks if a channel ID represents a group channel (starts with chat, diary, or heap).

---

#### `getChannelIdType`

```typescript
function getChannelIdType(channelId: string): 'dm' | 'club' | 'channel';
```

Returns the type of channel based on its ID format.

---

#### `isChannelId`

```typescript
function isChannelId(id: string): boolean;
```

Distinguishes between channel IDs and group IDs. Returns true if the ID represents any type of channel.

---

#### `getCanonicalPostId`

```typescript
function getCanonicalPostId(inputId: string): string;
```

Normalizes a post ID to canonical format by stripping author prefixes and formatting as dot-separated @ud.

---

## Urbit Utility Functions

#### `preSig`

```typescript
function preSig(ship: string): string;
```

Ensures a ship name has a leading sigil (~).

---

#### `desig`

```typescript
function desig(ship: string): string;
```

Removes the leading sigil (~) from a ship name.

---

#### `checkNest`

```typescript
function checkNest(nest: string): boolean;
```

Validates that a nest string is properly formatted.

---

#### `nestToFlag`

```typescript
function nestToFlag(nest: string): string;
```

Converts a nest identifier to a flag format.

---

#### `getChannelType`

```typescript
function getChannelType(nest: string): ChannelType;
```

Extracts the channel type from a nest identifier.

---

#### `getTextContent`

```typescript
function getTextContent(content: Story | Inline[]): string;
```

Extracts plain text content from a Story or Inline array.

---

#### `whomIsDm`

```typescript
function whomIsDm(whom: string): boolean;
```

Checks if a whom identifier represents a DM.

---

#### `whomIsMultiDm`

```typescript
function whomIsMultiDm(whom: string): boolean;
```

Checks if a whom identifier represents a group DM (multi-party DM).

---

## Logging

```typescript
import { createDevLogger } from '@tloncorp/api';

const logger = createDevLogger('MyModule');
logger.log('Info message');
logger.error('Error message');
```

---

## Environment Variables

For testing:

```bash
URBIT_SHIP_URL=http://localhost:8080
URBIT_SHIP_CODE=lidlut-tabwed-pillex-ridrup
```

## Running Tests

```bash
# Run all tests (skips integration tests if no ship configured)
pnpm test

# Run with ship connection
URBIT_SHIP_URL=http://localhost:8080 URBIT_SHIP_CODE=your-code pnpm test
```
