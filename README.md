## Development

Get the Simulator App and install it on the Simulator

```
yarn dev
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

## Todos

- get tailwind to work on the web (nativwind)
- move it into mono repo https://github.com/byCedric/expo-monorepo-example
- setup backend
- implement auth (from jumpstart)
- setup sync for the list
- add invitation scheme
