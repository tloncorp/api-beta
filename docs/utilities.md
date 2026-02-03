# Utility Functions

Helper functions for working with IDs, dates, and Urbit data formats.

## ID Helpers

### `isDmChannelId`

```typescript
function isDmChannelId(id: string): boolean;
```

Checks if a channel ID is a 1:1 DM (a ship name).

```typescript
isDmChannelId('~zod');                    // true
isDmChannelId('chat/~zod/general');       // false
isDmChannelId('0v4.00000.qd4p2...');      // false
```

---

### `isGroupDmChannelId`

```typescript
function isGroupDmChannelId(id: string): boolean;
```

Checks if a channel ID is a group DM.

```typescript
isGroupDmChannelId('0v4.00000.qd4p2.it253.qs53q.s53qs');  // true
isGroupDmChannelId('~zod');                                // false
```

---

### `isGroupChannelId`

```typescript
function isGroupChannelId(id: string): boolean;
```

Checks if a channel ID is a group channel (chat/diary/heap).

```typescript
isGroupChannelId('chat/~zod/general');    // true
isGroupChannelId('diary/~zod/blog');      // true
isGroupChannelId('heap/~zod/photos');     // true
isGroupChannelId('~zod');                 // false
```

---

### `getChannelIdType`

```typescript
function getChannelIdType(id: string): 'dm' | 'groupDm' | 'channel';
```

Returns the type of a channel ID.

```typescript
getChannelIdType('~zod');                 // 'dm'
getChannelIdType('0v4.00000.qd4p2...');   // 'groupDm'
getChannelIdType('chat/~zod/general');    // 'channel'
```

---

### `isChannelId`

```typescript
function isChannelId(id: string): boolean;
```

Checks if a string is a valid channel ID of any type.

---

### `getCanonicalPostId`

```typescript
function getCanonicalPostId(postId: string): string;
```

Normalizes a post ID to its canonical format.

---

## Date Utilities

### `udToDate`

```typescript
function udToDate(ud: string): Date;
```

Converts an Urbit date (`@ud`) to a JavaScript `Date` object.

```typescript
const date = udToDate('~2024.1.15..12.30.00');
console.log(date.toISOString());  // '2024-01-15T12:30:00.000Z'
```

---

## Urbit Utilities

### `preSig`

```typescript
function preSig(ship: string): string;
```

Ensures a ship name has the `~` prefix.

```typescript
preSig('zod');     // '~zod'
preSig('~zod');    // '~zod'
```

---

### `desig`

```typescript
function desig(ship: string): string;
```

Removes the `~` prefix from a ship name.

```typescript
desig('~zod');     // 'zod'
desig('zod');      // 'zod'
```

---

### `checkNest`

```typescript
function checkNest(nest: string): boolean;
```

Validates a nest (channel path) format.

---

### `nestToFlag`

```typescript
function nestToFlag(nest: string): string;
```

Converts a nest to a flag format.

---

### `getChannelType`

```typescript
function getChannelType(channelId: string): 'chat' | 'diary' | 'heap' | 'dm' | 'groupDm';
```

Gets the channel type from a channel ID.

```typescript
getChannelType('chat/~zod/general');   // 'chat'
getChannelType('diary/~zod/blog');     // 'diary'
getChannelType('heap/~zod/photos');    // 'heap'
getChannelType('~zod');                // 'dm'
```

---

### `getTextContent`

```typescript
function getTextContent(story: Story): string;
```

Extracts plain text content from a Story.

```typescript
const story: Story = [{ inline: ['Hello ', { bold: ['world'] }, '!'] }];
getTextContent(story);  // 'Hello world!'
```

---

### `whomIsDm`

```typescript
function whomIsDm(whom: string): boolean;
```

Checks if a whom identifier is a DM.

---

### `whomIsMultiDm`

```typescript
function whomIsMultiDm(whom: string): boolean;
```

Checks if a whom identifier is a group DM.

---

## Logging

### `createDevLogger`

```typescript
function createDevLogger(namespace: string): Logger;
```

Creates a namespaced logger for development debugging.

```typescript
const log = createDevLogger('my-app');
log('Fetching groups...');
log('Found', groups.length, 'groups');
```

**Logger interface:**
```typescript
interface Logger {
  (...args: any[]): void;
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}
```
