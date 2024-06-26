import { Link } from "expo-router";
import { ListTodo } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import sodium from "react-native-libsodium";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { CreateListForm } from "../components/createListForm";
import { Logout } from "../components/logout";
import { useLocker } from "../hooks/useLocker";
import { decryptString } from "../utils/decryptString";
import { getDocumentStorage } from "../utils/documentStorage";
import { trpc } from "../utils/trpc";
import { Avatar } from "./avatar";

export const DrawerContent: React.FC = () => {
  const meQuery = trpc.me.useQuery(undefined, {
    // avoid lot's of retries in case of unauthorized blocking a page load
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      if (failureCount > 3) return false;
      return true;
    },
  });

  const locker = useLocker();

  const documentsQuery = trpc.documents.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const documentNameStorage = getDocumentStorage().documentNameStorage;
  let keys = documentNameStorage.getAllKeys();
  if (documentsQuery.data) {
    const remoteDocumentIds = documentsQuery.data.map((doc) => doc.id);
    // merge remote and local keys and deduplicate them
    keys = Array.from(new Set([...keys, ...remoteDocumentIds]));
  }

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex flex-1 flex-col justify-between"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View className="gap-4">
        <View className="flex flex-row px-4 items-center gap-2 pt-4">
          <Avatar name={meQuery.data?.username || ""} />
          <Text>{meQuery.data?.username}</Text>
        </View>

        <View className="px-4">
          <CreateListForm />
        </View>

        <View className="flex flex-col px-2">
          {keys.map((docId) => {
            if (!locker.content[`document:${docId}`]) {
              return null;
            }
            const documentKey = sodium.from_base64(
              locker.content[`document:${docId}`]
            );
            const doc = documentsQuery.data?.find((doc) => doc.id === docId);
            const name = doc
              ? decryptString({
                  ciphertext: doc.nameCiphertext,
                  commitment: doc.nameCommitment,
                  nonce: doc.nameNonce,
                  key: documentKey,
                })
              : getDocumentStorage().documentNameStorage.getString(docId);

            // store the name if it's not already stored
            if (!documentNameStorage.getString(docId)) {
              documentNameStorage.set(docId, name || "Untitled");
            }

            return (
              <Link href={`/list/${docId}`} key={docId} asChild>
                <View className="flex flex-row items-center gap-2 rounded-lg transition-all hover:bg-accent p-2">
                  <View className="w-4">
                    <ListTodo
                      width={16}
                      height={16}
                      className="text-foreground"
                    />
                  </View>
                  <Text className="text-xl" numberOfLines={1}>
                    {name || "Untitled"}
                  </Text>
                </View>
              </Link>
            );
          })}
        </View>
      </View>
      <View className="p-4">
        <Logout />
      </View>
    </View>
  );
};
