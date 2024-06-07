import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { decryptString } from "../utils/decryptString";
import { documentNameStorage } from "../utils/documentStorage";
import { encryptString } from "../utils/encryptString";
import { trpc } from "../utils/trpc";
import { SubtleInput } from "./subtleInput";

type Props = {
  documentId: string;
  documentKey: Uint8Array;
};

export const UpdateDocumentNameForm = ({ documentId, documentKey }: Props) => {
  const [name, setName] = useState(() => {
    return documentNameStorage.getString(documentId) || "";
  });

  const getDocumentQuery = trpc.getDocument.useQuery(documentId, {
    refetchInterval: 5000,
  });
  const updateDocumentMutation = trpc.updateDocument.useMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (getDocumentQuery.data) {
      const name = decryptString({
        ciphertext: getDocumentQuery.data.nameCiphertext,
        commitment: getDocumentQuery.data.nameCommitment,
        nonce: getDocumentQuery.data.nameNonce,
        key: documentKey,
      });

      setName(name);
    }
  }, [getDocumentQuery.data?.nameCiphertext]);

  const updateName = async (name: string) => {
    documentNameStorage.set(documentId, name);
    const { ciphertext, nonce, commitment } = encryptString({
      value: name,
      key: documentKey,
    });
    updateDocumentMutation.mutate(
      {
        id: documentId,
        nameCiphertext: ciphertext,
        nameNonce: nonce,
        nameCommitment: commitment,
      },
      {
        onError: () => {
          Alert.alert("Failed to update the list name on the server.");
        },
      }
    );
    const documentsQueryKey = getQueryKey(trpc.documents, undefined, "query");
    queryClient.invalidateQueries({
      queryKey: [documentsQueryKey],
    });
  };

  return (
    <View className="px-4">
      <SubtleInput
        placeholder="List name"
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        value={name}
        onChangeText={(value) => {
          setName(value);
          updateName(value);
        }}
      />
    </View>
  );
};
