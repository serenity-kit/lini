import { Theme, ThemeProvider } from "@react-navigation/native";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { SplashScreen } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { DrawerContent } from "../components/drawerContent";
import "../global.css";
import { useIsPermanentLeftDrawer } from "../hooks/useIsPermanentDrawer";
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

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { isDarkColorScheme } = useColorScheme();
  const isLoadingComplete = useLoadingLibsodium();

  useEffect(() => {
    if (isLoadingComplete) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingComplete]);

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

  const isPermanentLeftDrawer = useIsPermanentLeftDrawer();
  const { width: fullWidth } = useWindowDimensions();

  console.log(isPermanentLeftDrawer);

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
            {/* <Stack>
              <Stack.Screen
                name="index"
                options={{
                  // Hide the header for all other routes.
                  title: "Lists",
                }}
              />
            </Stack> */}

            <GestureHandlerRootView style={{ flex: 1 }}>
              <Drawer
                drawerContent={DrawerContent}
                screenOptions={{
                  // headerShown: false,
                  drawerType: isPermanentLeftDrawer ? "permanent" : "front",
                  // drawerType: "permanent",
                  drawerStyle: {
                    width: isPermanentLeftDrawer ? 240 : fullWidth,
                  },
                  overlayColor: "transparent",

                  drawerPosition: "left",
                  // drawerStyle: {
                  //   width: 240,
                  // },
                }}
              />
            </GestureHandlerRootView>

            {/* Default Portal Host (one per app) */}
            {/* <PortalHost /> */}
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
