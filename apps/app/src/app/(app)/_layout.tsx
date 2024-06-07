import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Pressable, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PanelLeft } from "~/lib/icons/PanelLeft";
import { DrawerContent } from "../../components/drawerContent";
import { useIsPermanentLeftDrawer } from "../../hooks/useIsPermanentDrawer";

export default function Layout() {
  const isPermanentLeftDrawer = useIsPermanentLeftDrawer();
  const { width: fullWidth } = useWindowDimensions();
  const navigation = useNavigation();

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
          headerLeft: () => {
            const navigation = useNavigation();

            return (
              <Pressable
                className="p-6"
                onPress={() =>
                  navigation.dispatch(DrawerActions.toggleDrawer())
                }
              >
                <PanelLeft className="text-black" />
              </Pressable>
            );
          },
          headerTitle: () => null,
          // drawerStyle: {
          //   width: 240,
          // },
        }}
      />
    </GestureHandlerRootView>
  );
}
