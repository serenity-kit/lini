import { Drawer } from "expo-router/drawer";
import { useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DrawerContent } from "../../components/drawerContent";
import { useIsPermanentLeftDrawer } from "../../hooks/useIsPermanentDrawer";

export default function Layout() {
  const isPermanentLeftDrawer = useIsPermanentLeftDrawer();
  const { width: fullWidth } = useWindowDimensions();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={DrawerContent}
        screenOptions={{
          drawerType: isPermanentLeftDrawer ? "permanent" : "front",
          drawerStyle: {
            width: isPermanentLeftDrawer ? 240 : fullWidth,
          },
          overlayColor: "transparent",
          drawerPosition: "left",
          headerShown: isPermanentLeftDrawer ? false : true,
          // headerLeft: () => {
          //   return <PanelLeft />;
          // },
          headerTitle: () => null,
          // drawerStyle: {
          //   width: 240,
          // },
        }}
      />
    </GestureHandlerRootView>
  );
}
