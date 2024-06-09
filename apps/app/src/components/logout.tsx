import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { clearLockerKey } from "../locker/lockerKeyStorage";
import {
  getLockerStorage,
  rotateLockerStorageKey,
} from "../locker/lockerStorage";
import { getDocumentStorage, rotateStorageKey } from "../utils/documentStorage";
import { clearSessionKey } from "../utils/sessionKeyStorage";
import { trpc } from "../utils/trpc";

export const Logout: React.FC = () => {
  const logoutMutation = trpc.logout.useMutation();
  const queryClient = useQueryClient();

  const clearAllStores = async () => {
    getLockerStorage().clearAll();
    const documentStorage = getDocumentStorage();
    documentStorage.documentNameStorage.clearAll();
    documentStorage.documentStorage.clearAll();
    documentStorage.documentPendingChangesStorage.clearAll();
    queryClient.invalidateQueries();
    await clearSessionKey();
    await clearLockerKey();
    if (Platform.OS !== "web") {
      await rotateLockerStorageKey();
      await rotateStorageKey();
    }
  };

  return (
    <Button
      // not perfect but good enough since the local changes are fast
      disabled={logoutMutation.isPending}
      variant="outline"
      onPress={async () => {
        await clearAllStores();
        logoutMutation.mutate(undefined, {
          onSuccess: async () => {
            // delete again to verify in case new info came in during the logout request
            await clearAllStores();
            router.navigate("/login");
          },
          onError: () => {
            Alert.alert("Failed to logout");
          },
        });
      }}
    >
      <Text>Logout</Text>
    </Button>
  );
};
