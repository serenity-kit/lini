import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import sodium from "react-native-libsodium";

export default function useLoadingLibsodium() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function load() {
      try {
        SplashScreen.preventAutoHideAsync();
        await sodium.ready; // sodium must be ready before we load any devices or similar
      } catch (e) {
        Alert.alert("Couldn't load encryption library");
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    load();
  }, []);

  return isLoadingComplete;
}
