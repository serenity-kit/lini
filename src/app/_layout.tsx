import { makeDb } from "@livestore/expo";
import { Stack } from "expo-router";
import "../global.css";
// import { sql } from "@livestore/livestore";
import { LiveStoreProvider } from "@livestore/livestore/react";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Text, unstable_batchedUpdates } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "../components/primitives/portal.tsx";
import { NAV_THEME } from "../lib/constants.ts";
import { useColorScheme } from "../lib/useColorScheme.ts";
import { schema } from "../schema/index.ts";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <LiveStoreProvider
          schema={schema}
          fallback={<Text>Loading...</Text>}
          // boot={(db) => {
          //   db.execute(
          //     sql`INSERT OR IGNORE INTO todos (id, text, completed) VALUES ('t1', 'call johannes', 1)`
          //   );
          // }}
          makeDb={makeDb({
            migrations: { strategy: "from-mutation-log" },
            fileNamePrefix: "koriko-",
          })}
          // NOTE This is currently necessary to properly batch updates in React Native
          batchUpdates={(run) => unstable_batchedUpdates(() => run())}
        >
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                // Hide the header for all other routes.
                title: "Workouts",
              }}
            />
            <Stack.Screen
              name="choose-exercise"
              options={{
                // Sequence the presentation mode to modal for our modal route.
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="export-workout"
              options={{
                // Sequence the presentation mode to modal for our modal route.
                presentation: "modal",
                title: "Export Workout",
              }}
            />
          </Stack>
          {/* Default Portal Host (one per app) */}
          <PortalHost />
        </LiveStoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
