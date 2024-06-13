## Development

### Setup

```sh
pnpm install
docker-compose up
```

```sh
# in another tab
cd apps/server
cp .env.example .env
npx @serenity-kit/opaque@latest create-server-setup
# copy the string value as OPAQUE_SERVER_SETUP .env
pnpm prisma migrate dev
pnpm dev
```

```sh
# in another tab
cd apps/app
cp .env.example .env
pnpm dev
```

### Updating the Database Schema

1. Make changes
2. Run `pnpm prisma migrate dev`
3. Run `pnpm prisma generate`
4. Restart the TS server in your editor

### DB UI

```bash
cd apps/backend
pnpm prisma studio
```

### Wipe all local data

```bash
cd apps/backend
pnpm prisma migrate reset
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
fly postgres connect -a <production-app-db-name>
```

```sh
# list dbs
\list
# connect to a db
\c <db_name>;
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
  listKeyLockbox,
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

TODO better version where the token is also never exposed to the network so not even the ciphertext can be retrieved by a network attacker
