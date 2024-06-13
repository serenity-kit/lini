import { useWindowDimensions } from "react-native";

export const sidebarBreakPoint = 768; // md

export function useIsPermanentLeftDrawer() {
  const { width } = useWindowDimensions();
  return width > sidebarBreakPoint;
}
