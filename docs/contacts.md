# Contacts API

Fetch and manage user contacts and profiles.

## Functions

### `getContacts`

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
- `attestations` - Array of verified identity attestations

**Example:**
```typescript
const contacts = await getContacts();
// Returns: [
//   {
//     id: '~bus',
//     nickname: 'Bus Ship',
//     peerNickname: 'Bus Ship',
//     avatarImage: 'https://example.com/bus-avatar.jpg',
//     bio: 'Just a friendly ship',
//     status: 'Online',
//     isContact: true
//   },
//   {
//     id: '~nec',
//     nickname: 'Nec',
//     customNickname: 'My Friend Nec',  // You set this nickname
//     avatarImage: 'https://example.com/nec-avatar.jpg',
//     isContact: true,
//     isBlocked: false
//   }
// ]
```

---

### `updateContactMetadata`

```typescript
async function updateContactMetadata(contactId: string, metadata: { nickname?: string; avatarImage?: string }): Promise<void>;
```

Updates a contact's custom nickname and/or avatar image override.

**Example:**
```typescript
await updateContactMetadata('~bus', {
  nickname: 'Best Friend',
  avatarImage: 'https://example.com/custom-avatar.jpg'
});
```

---

### `removeContactSuggestion`

```typescript
async function removeContactSuggestion(contactId: string): Promise<void>;
```

Hides a suggested contact from the suggestions list.

---

### `addContactSuggestions`

```typescript
async function addContactSuggestions(contactIds: string[]): Promise<void>;
```

Adds multiple contacts to the suggestions list.

---

### `syncUserProfiles`

```typescript
async function syncUserProfiles(userIds: string[]): Promise<void>;
```

Triggers profile sync for a list of users, fetching their latest profile data.
