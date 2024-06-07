import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as sodium from "react-native-libsodium";
import { generateId } from "secsync";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useLocker } from "../hooks/useLocker";
import { documentNameStorage } from "../utils/documentStorage";
import { encryptString } from "../utils/encryptString";
import { trpc } from "../utils/trpc";

export const CreateListForm: React.FC = () => {
  const createDocumentMutation = trpc.createDocument.useMutation();
  const { addItem } = useLocker();
  const queryClient = useQueryClient();

  return (
    <Button
      disabled={createDocumentMutation.isPending}
      onPress={() => {
        const key = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
        // @ts-expect-error not matching libsodium types
        const documentId = generateId(sodium);

        const {
          ciphertext: nameCiphertext,
          nonce: nameNonce,
          commitment: nameCommitment,
        } = encryptString({
          value: "",
          key,
        });

        createDocumentMutation.mutate(
          {
            id: documentId,
            nameCiphertext,
            nameNonce,
            nameCommitment,
          },
          {
            onSuccess: async ({ document }) => {
              addItem({
                type: "document",
                documentId: document.id,
                value: sodium.to_base64(key),
              });
              documentNameStorage.set(document.id, "");

              router.navigate({
                pathname: `/list/[documentId]`,
                params: { documentId: document.id },
              });
              const documentsQueryKey = getQueryKey(
                trpc.documents,
                undefined,
                "query"
              );
              queryClient.invalidateQueries({
                queryKey: [documentsQueryKey],
              });
            },
            onError: () => {
              Alert.alert("Failed to create the list");
            },
          }
        );
      }}
    >
      <Text>Create List</Text>
    </Button>
  );
};
