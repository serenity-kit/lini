import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { lockerStorage } from "../hooks/useLocker";
import {
  documentNameStorage,
  documentPendingChangesStorage,
  documentStorage,
} from "../utils/documentStorage";
import { sessionKeyStorage } from "../utils/sessionKeyStorage";
import { trpc } from "../utils/trpc";

export const Logout: React.FC = () => {
  const logoutMutation = trpc.logout.useMutation();
  const queryClient = useQueryClient();

  const clearAllStores = () => {
    lockerStorage.clearAll();
    documentNameStorage.clearAll();
    documentStorage.clearAll();
    documentPendingChangesStorage.clearAll();
    sessionKeyStorage.clearAll();
    queryClient.invalidateQueries();
  };

  return (
    <Button
      // not perfect but good enough since the local changes are fast
      disabled={logoutMutation.isPending}
      variant="outline"
      onPress={async () => {
        clearAllStores();
        logoutMutation.mutate(undefined, {
          onSuccess: () => {
            // delete again to verify in case new info came in during the logout request
            clearAllStores();
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
