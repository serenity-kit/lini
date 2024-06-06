## Development

### Setup

```sh
yarn install
docker-compose up
```

```sh
# in another tab
cd apps/server
cp .env.example .env
npx @serenity-kit/opaque@latest create-server-setup
# copy the string value as OPAQUE_SERVER_SETUP .env
yarn prisma migrate dev
yarn dev
```

```sh
# in another tab
cd apps/frontend
yarn dev
```

### Updating the Database Schema

1. Make changes
2. Run `yarn prisma migrate dev`
3. Run `yarn prisma generate`
4. Restart the TS server in your editor

### DB UI

```bash
cd apps/backend
yarn prisma studio
```

### Wipe all local data

```bash
cd apps/backend
yarn prisma migrate reset
```

## EAS Build

Simulator build:

```sh
eas build --profile development-simulator --platform ios
```

Internal distribution build:

```sh
eas build --profile preview --platform ios
```

## Setup Production Environment and CI

see [docs/setup-production-environment-and-ci.md](docs/setup-production-environment-and-ci.md)

## Connect to the Production Database

```sh
fly postgres connect -a koriki-db
```

```sh
# list dbs
\list;
# connect to a db
\c lini;
# list tables
\dt
# query a table
SELECT * FROM "Document";
```

## Architecture

### Authentication

Users use OPAQUE to authenticate with the server. After Login the server creates a session and stores it as HTTP-Only Cookie. The session is used to authenticate the user for authenticated requests and also to connect to the Websocket.

### Invitation

Users can invite other users to a list via an invitation link.

Creating an invitation link:

```ts
const seed = generateSeed();
const (privKey, pubKey) = generateKeyPair(seed);
const listKeyLockbox = encrypt(pubKey, listKey);
const invitation = {
  listId,
  listKeyLockbox,
  pubKey,
};
const encryptedInvitation = encrypt(invitation, sessionKey);
```

InvitationLink: `${token}/#accessKey=${seed}`

Accepting an invitation:

```ts
const (privKey, pubKey) = generateKeyPair(seed);
const encryptedInvitation getInvitationByToken(token);
const invitation = decrypt(encryptedInvitation, sessionKey)
const listKey = decrypt(invitation.listKeyLockbox, privKey)
acceptInvitation(listId, listKey)
```

## Todos

- allow to delete list (needs a tombstone)

- figure out how author keys are managed (tabs in serenity and possible change in secsync)
- add retry for locker in case write fails (invalid clock)
- store the list name locally (also with unsynced changes)
- encrypt MMKV storage on iOS and Android

- allow to sync lists in the background
- fix websocket session auth in secsync
