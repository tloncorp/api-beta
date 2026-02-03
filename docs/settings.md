# Settings & Storage API

User settings, app info, file storage configuration, and connection status.

## Settings

### `getSettings`

```typescript
async function getSettings(): Promise<{
    settings: db.Settings;
    pendingMemberDismissals: db.PendingMemberDismissals;
}>;
```

Fetches all user settings including theme, display preferences, and dismissal states.

---

### `setSetting`

```typescript
async function setSetting(key: string, val: any): Promise<void>;
```

Updates a single setting value, automatically routing to the appropriate settings bucket.

---

### `subscribeToSettings`

```typescript
function subscribeToSettings(handler: (update: SettingsUpdate) => void): void;
```

Subscribes to real-time settings changes.

---

### `getAppInfo`

```typescript
async function getAppInfo(): Promise<Partial<db.AppInfo>>;
```

Fetches application metadata including groups desk version, hash, and sync node.

---

## Storage

### `getStorageConfiguration`

```typescript
async function getStorageConfiguration(): Promise<StorageConfiguration>;
```

Retrieves the current S3-compatible storage configuration.

---

### `getStorageCredentials`

```typescript
async function getStorageCredentials(): Promise<StorageCredentials>;
```

Fetches the current storage credentials for file uploads.

---

### `subscribeToStorageUpdates`

```typescript
async function subscribeToStorageUpdates(eventHandler: (update: StorageUpdate) => void): Promise<void>;
```

Subscribes to storage configuration changes.

---

## Connection Status

### `getLastConnectionStatus`

```typescript
async function getLastConnectionStatus(contactId: string): Promise<ConnectionStatus>;
```

Retrieves the last known connection status for a specific ship/contact.

---

### `checkConnectionStatus`

```typescript
async function checkConnectionStatus(contactId: string, callback: (data: ConnectionStatus) => boolean): Promise<subscription>;
```

Initiates a connection check to a ship and subscribes to status updates.

---

## Invites

### `createInviteLink`

```typescript
async function createInviteLink(groupId: string): Promise<string>;
```

Creates an invite link for a group.

---

### `enableGroup`

```typescript
async function enableGroup(groupId: string): Promise<void>;
```

Enables a group for invite link sharing.

---

### `createPersonalInviteLink`

```typescript
async function createPersonalInviteLink(): Promise<string>;
```

Creates a personal invite link for the current user.

---

### `checkExistingUserInviteLink`

```typescript
async function checkExistingUserInviteLink(): Promise<string | null>;
```

Checks if the user has an existing invite link.

---

## Attestations (Lanyard)

### `subscribeToLanyardUpdates`

```typescript
async function subscribeToLanyardUpdates(handler: (update: LanyardUpdate) => void): Promise<void>;
```

Subscribes to lanyard (attestation) updates.

---

### `checkAttestedSignature`

```typescript
async function checkAttestedSignature(params: { ... }): Promise<boolean>;
```

Verifies an attested signature.

---

### `discoverContacts`

```typescript
async function discoverContacts(params: { ... }): Promise<Contact[]>;
```

Discovers contacts based on attestations.

---

## Link Metadata

### `getLinkMetadata`

```typescript
async function getLinkMetadata(url: string): Promise<LinkMetadata>;
```

Fetches metadata (title, description, image) for a URL.

---

### `getFallbackLinkMetadata`

```typescript
async function getFallbackLinkMetadata(url: string): Promise<LinkMetadata>;
```

Fetches link metadata using a fallback method.

---

## Data Sync

### `fetchChangesSince`

```typescript
async function fetchChangesSince(params: { timestamp: number }): Promise<ChangesResult>;
```

Fetches all changes since a given timestamp for offline sync.

---

## Hosting

### `HostingError`

```typescript
class HostingError extends Error {
    code: string;
    constructor(message: string, code: string);
}
```

Error class for hosting-related failures.

---

### `getReservableShips`

```typescript
async function getReservableShips(): Promise<string[]>;
```

Gets available ships that can be reserved.

---

### `reserveShip`

```typescript
async function reserveShip(shipName: string): Promise<void>;
```

Reserves a ship name.

---

### `allocateReservedShip`

```typescript
async function allocateReservedShip(shipName: string): Promise<void>;
```

Allocates a previously reserved ship.

---

### `getShipAccessCode`

```typescript
async function getShipAccessCode(shipName: string): Promise<string>;
```

Gets the access code for a hosted ship.

---

### `resumeShip`

```typescript
async function resumeShip(shipName: string): Promise<void>;
```

Resumes a paused hosted ship.

---

### `getShip`

```typescript
async function getShip(shipName: string): Promise<ShipInfo>;
```

Gets information about a hosted ship.

---

### `checkPhoneVerify`

```typescript
async function checkPhoneVerify(phone: string): Promise<boolean>;
```

Checks phone verification status.

---

### `requestPhoneVerify`

```typescript
async function requestPhoneVerify(phone: string): Promise<void>;
```

Requests phone verification.

---

### `getHostingAvailability`

```typescript
async function getHostingAvailability(): Promise<HostingAvailability>;
```

Checks hosting availability.

---

### `getHostingHeartBeat`

```typescript
async function getHostingHeartBeat(): Promise<void>;
```

Sends a heartbeat to the hosting service.

---

## AI Summarization

### `summarizeMessage`

```typescript
async function summarizeMessage(params: SummarizeMessageParams): Promise<SummarizeMessageResponse>;
```

Summarizes a message using AI (requires OpenRouter configuration).

---

## Authentication

### `getLandscapeAuthCookie`

```typescript
async function getLandscapeAuthCookie(url: string, code: string): Promise<string>;
```

Gets the authentication cookie for Landscape.
