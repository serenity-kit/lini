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

## Notes

- Doesn't yet support Expo Web
  - [ ] Missing support for `expo-sqlite/next` on web
  - [ ] Bug: No support for `import.meta` on web (even when using babel plugin)
- Transactional state updates will only work with `RCT_NEW_ARCH_ENABLED=1` (i.e. `RCT_NEW_ARCH_ENABLED=1 pod install` in the `ios` directory)
- The app SQLite database is stored in the app's `Library` directory (e.g. `/Users/<USERNAME>/Library/Developer/CoreSimulator/Devices/<DEVICE_ID>/data/Containers/Data/Application/<APP_ID>/Documents/SQLite/app.db`)

## Setup requirements

Set `export RCT_NEW_ARCH_ENABLED=1` in your shell

- Until Expo supports the bytecode SQLite flag out of the box, you have to use the dev build of the app (i.e. Expo Go is not yet supported).

  - `pnpm expo prebuild -p ios` (generates the `ios` Xcode project)
  - Optional: `xed ios` (to open the project in Xcode)

- Until Expo properly supports PNPM we also need the following
  - Some workarounds in `metra.config.js` + `@babel/runtime` in `package.json`
  - Extra dependencies in `package.json` for iOS `Release` builds
    ```json
    "expo-asset": "^9.0.2",
    "@react-native/assets-registry": "^0.74.0",
    "babel-preset-expo": "^10.0.1",
    ```
  - `"expo-modules-autolinking@1.10.3": "patches/expo-modules-autolinking@1.10.3.patch"`

## Todos

- use a better unique ID generation (regenerate the exercises.json)
- Add functionality to move sets up or down (context menu)
- Copy a workout
- Create a template (add reference from the workout to the template - especially the specific version in time (can be later on))

- /Users/<username>/Library/Developer/CoreSimulator/Devices/B302DA47-0271-45EC-8637-199CC6D98006/data/Containers/Data/Application/E35218E0-575D-462D-A700-4438E5652890/Documents/SQLite
