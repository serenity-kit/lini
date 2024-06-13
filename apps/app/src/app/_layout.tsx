import { Theme, ThemeProvider } from "@react-navigation/native";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { TRPCClientError, httpBatchLink } from "@trpc/client";
import {
  Slot,
  SplashScreen,
  router,
  useNavigationContainerRef,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "~/components/primitives/portal";
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

const apiUrl = process.env.EXPO_PUBLIC_API_ENDPOINT as string;

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const isLoadingComplete = useLoadingLibsodium();

  useEffect(() => {
    // without it the `dark` class is not added on web
    if (Platform.OS === "web") {
      if (isDarkColorScheme) {
        globalThis.window?.document.documentElement.classList.add("dark");
      } else {
        globalThis.window?.document.documentElement.classList.remove("dark");
      }
    }

    if (isLoadingComplete) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingComplete]);

  const navigationRef = useNavigationContainerRef(); // You can also use a regular ref with `React.useRef()`

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (
              error instanceof TRPCClientError &&
              error.data?.code === "UNAUTHORIZED" &&
              !(
                navigationRef.getRootState().routes[0].name === "login" ||
                navigationRef.getRootState().routes[0].name === "register"
              )
            ) {
              queryClient.clear();
              // const redirect = pathname !== "/" ? "?redirect=" + pathname : "";
              // router.navigate(`/login${redirect}`);
              router.navigate(`/`);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (
              error instanceof TRPCClientError &&
              error.data?.code === "UNAUTHORIZED" &&
              !(
                navigationRef.getRootState().routes[0].name === "login" ||
                navigationRef.getRootState().routes[0].name === "register"
              )
            ) {
              queryClient.clear();
              // const redirect = pathname !== "/" ? "?redirect=" + pathname : "";
              // router.navigate(`/login${redirect}`);
              router.navigate(`/`);
            }
          },
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

            <Slot />

            {/* Default Portal Host (one per app) */}
            <PortalHost />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
