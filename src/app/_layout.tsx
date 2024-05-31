import { Theme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import useLoadingLibsodium from "../hooks/useLoadingLibsodium";
import { NAV_THEME } from "../lib/constants";
import { useColorScheme } from "../lib/useColorScheme";

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

  const isLoadingComplete = useLoadingLibsodium();

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              // Hide the header for all other routes.
              title: "Lists",
            }}
          />
        </Stack>
        {/* Default Portal Host (one per app) */}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
