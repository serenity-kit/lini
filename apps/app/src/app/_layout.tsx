import { Theme, ThemeProvider } from "@react-navigation/native";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import "../global.css";
import useLoadingLibsodium from "../hooks/useLoadingLibsodium";
import { trpc } from "../utils/trpc";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

// TODO PROD API URL
const apiUrl = "http://localhost:3030/api";

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();
  const isLoadingComplete = useLoadingLibsodium();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // TODO
          // onError: (error) => {
          //   if (
          //     error instanceof TRPCClientError &&
          //     error.data?.code === "UNAUTHORIZED" &&
          //     window.location.pathname !== "/login"
          //   ) {
          //     removeLocalDb();
          //     queryClient.clear();
          //     router.navigate({
          //       to: "/login",
          //       search: { redirect: window.location.pathname },
          //     });
          //   }
          // },
        }),
        mutationCache: new MutationCache({
          // TODO
          // onError: (error) => {
          //   if (
          //     error instanceof TRPCClientError &&
          //     error.data?.code === "UNAUTHORIZED" &&
          //     window.location.pathname !== "/login"
          //   ) {
          //     removeLocalDb();
          //     queryClient.clear();
          //     router.navigate({
          //       to: "/login",
          //       search: { redirect: window.location.pathname },
          //     });
          //   }
          // },
        }),
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: apiUrl,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
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
            {/* <PortalHost /> */}
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
