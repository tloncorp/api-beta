# Core Client API

Low-level client functions for connecting to and communicating with Urbit ships.

## `Urbit` Class

The main HTTP client class for connecting to Urbit ships.

```typescript
const client = new Urbit(url: string, code?: string);
```

**Methods:**
- `connect()` - Authenticate and establish connection
- `poke<T>(params)` - Send a poke to a Gall agent
- `scry<T>(params)` - Scry data from an agent
- `subscribe(params)` - Subscribe to a path for updates
- `subscribeOnce<T>(app, path)` - One-time subscription
- `unsubscribe(id)` - Unsubscribe from a subscription
- `thread<T>(params)` - Run a spider thread
- `reset()` - Reset connection and clear subscriptions

---

## Error Classes

### `BadResponseError`

```typescript
class BadResponseError extends Error {
    status: number;
    body: string;
    constructor(status: number, body: string);
}
```

Thrown when an HTTP request returns a non-successful response.

### `TimeoutError`

```typescript
class TimeoutError extends Error {
    connectionStatus: string;
    timeoutDuration: number | null;
    constructor(options: { connectionStatus?: string; timeoutDuration?: number });
}
```

Thrown when an operation times out.

### `AuthError`

```typescript
class AuthError extends Error {}
```

Thrown when authentication fails (invalid access code or expired session).

---

## Client Functions

### `configureClient`

```typescript
function configureClient(params: ClientParams): void;
```

**Parameters:**
- `params.shipName: string` - The ship's name (e.g., '~zod')
- `params.shipUrl: string` - The ship's URL (e.g., 'http://localhost:8080')
- `params.verbose?: boolean` - Enable verbose logging
- `params.fetchFn?: typeof fetch` - Custom fetch implementation
- `params.getCode?: () => Promise<string>` - Function to retrieve auth code for re-authentication
- `params.handleAuthFailure?: () => void` - Callback for auth failures
- `params.onQuitOrReset?: (cause) => void` - Callback for connection issues
- `params.onChannelStatusChange?: (status) => void` - Callback for status changes

**IMPORTANT:** This configures the internal singleton client used by all high-level API functions (`sendPost`, `getGroups`, `getCurrentUserId`, etc.). You must call this before using those functions.

**Note:** Creating a `new Urbit()` instance does NOT configure the singleton.

```typescript
import { configureClient, sendPost, getCurrentUserId } from '@tloncorp/api';

configureClient({
  shipName: '~zod',
  shipUrl: 'http://localhost:8080',
  getCode: async () => 'lidlut-tabwed-pillex-ridrup',
});

const myShip = getCurrentUserId();
await sendPost({ channelId, authorId: myShip, sentAt: Date.now(), content: [...] });
```

---

### `getCurrentUserId`

```typescript
function getCurrentUserId(): string;
```

Returns the ship name (with sigil) of the currently authenticated user.

---

### `getCurrentUserIsHosted`

```typescript
function getCurrentUserIsHosted(): boolean;
```

Returns whether the current user's ship is running on Tlon's hosted infrastructure.

---

### `poke`

```typescript
async function poke(params: PokeParams): Promise<number>;
```

**Parameters:**
- `params.app: string` - The target application name
- `params.mark: string` - The mark (type) of the poke data
- `params.json: any` - The JSON payload to send

**Returns:** The poke ID

Sends a JSON poke (command) to an Urbit application.

---

### `pokeNoun`

```typescript
async function pokeNoun<T>(params: NounPokeParams): Promise<number | undefined>;
```

**Parameters:**
- `params.app: string` - The target application name
- `params.mark: string` - The mark (type) of the poke data
- `params.noun: Noun` - The noun (binary) payload to send

Sends a noun (binary/Nock) poke for more efficient data transfer.

---

### `scry`

```typescript
async function scry<T>(params: { app: string; path: string; timeout?: number }): Promise<T>;
```

**Parameters:**
- `params.app: string` - The application to scry from
- `params.path: string` - The scry path
- `params.timeout?: number` - Optional timeout in milliseconds (default: 60000)

Performs a synchronous read (scry) from an Urbit application's state.

---

### `scryNoun`

```typescript
async function scryNoun(params: { app: string; path: string; timeout?: number }): Promise<Noun>;
```

Performs a synchronous read returning the result in noun (binary/Nock) format.

---

### `subscribe`

```typescript
async function subscribe<T>(endpoint: { app: string; path: string }, handler: (update: T, id?: number) => void): Promise<number>;
```

**Returns:** The subscription ID

Creates a persistent subscription to an Urbit application path. The handler is called for each event received.

---

### `subscribeOnce`

```typescript
async function subscribeOnce<T>(endpoint: { app: string; path: string }, timeout?: number): Promise<T>;
```

**Returns:** The first event received on the subscription

Creates a one-shot subscription that resolves with the first event and then automatically unsubscribes.

---

### `unsubscribe`

```typescript
async function unsubscribe(id: number): Promise<void>;
```

Cancels an active subscription by its ID.

---

### `thread`

```typescript
async function thread<T, R = any>(params: { desk: string; threadName: string; inputMark: string; outputMark: string; body: T; timeout?: number }): Promise<R>;
```

Executes an Urbit thread (a one-off computation) and returns the result.

---

### `request`

```typescript
async function request<T>(path: string, options?: RequestInit, timeout?: number): Promise<T>;
```

Makes a raw HTTP request through the Urbit client.

---

### `checkIsNodeBusy`

```typescript
async function checkIsNodeBusy(): Promise<'available' | 'busy' | 'unknown'>;
```

Checks whether the Urbit node is currently busy processing requests.

---

## Initialization

### `getInitData`

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

**Example:**
```typescript
const initData = await getInitData();
// Returns: {
//   groups: [
//     { id: '~sampel-palnet/book-club', title: 'Book Club', ... },
//   ],
//   channels: [
//     { id: 'chat/~sampel-palnet/general', type: 'chat', ... },
//     { id: '~bus', type: 'dm', ... }
//   ],
//   unreads: {
//     groupUnreads: [...],
//     channelUnreads: [...],
//     threadActivity: []
//   },
//   pins: [...],
//   hiddenPosts: [],
//   blockedUsers: []
// }
```
