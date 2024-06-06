import { Link } from "expo-router";
import * as React from "react";
import { View } from "react-native";
import sodium from "react-native-libsodium";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { CreateListForm } from "../components/createListForm";
import { Logout } from "../components/logout";
import { useLocker } from "../hooks/useLocker";
import { decryptString } from "../utils/decryptString";
import { documentNameStorage } from "../utils/documentStorage";
import { trpc } from "../utils/trpc";

const Lists: React.FC = () => {
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
  let keys = documentNameStorage.getAllKeys();
  if (documentsQuery.data) {
    const remoteDocumentIds = documentsQuery.data.map((doc) => doc.id);
    // merge remote and local keys and deduplicate them
    keys = Array.from(new Set([...keys, ...remoteDocumentIds]));
  }

  return (
    <View>
      <Link href="/login">
        <Text>Login</Text>
      </Link>
      <Link href="/register">Register</Link>

      <View>
        <Text>{meQuery.data?.username}</Text>
      </View>

      <Logout />

      <CreateListForm />

      <View className="flex flex-col gap-2 pt-4">
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
            : documentNameStorage.getString(docId);

          return (
            <Link href={`/list/${docId}`} key={docId} asChild>
              <Card className="flex flex-col items-start gap-2 rounded-lg border p-5 text-left text-xl transition-all hover:bg-accent">
                <Text>{name}</Text>
              </Card>
            </Link>
          );
        })}
      </View>
    </View>
  );
};

export default Lists;
