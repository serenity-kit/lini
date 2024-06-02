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
\c koriko;
# list tables
\dt
# query a table
SELECT * FROM "Document";
```

## Architecture

### Authentication

Users use OPAQUE to authenticate with the server. After Login the server creates a session and stores it as HTTP-Only Cookie. The session is used to authenticate the user for authenticated requests and also to connect to the Websocket.

## Todos

- setup CI (ts:check)
- generate keys and store them locally
- store keys on lockbox
- add invitation scheme

- store data locally (api in secsync)
- fix websocket session auth in secsync
