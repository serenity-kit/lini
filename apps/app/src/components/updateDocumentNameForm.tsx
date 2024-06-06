import { useEffect, useState } from "react";
import { View } from "react-native";
import { Input } from "~/components/ui/input";
import { decryptString } from "../utils/decryptString";
import { encryptString } from "../utils/encryptString";
import { trpc } from "../utils/trpc";

type Props = {
  documentId: string;
  documentKey: Uint8Array;
};

export const UpdateDocumentNameForm = ({ documentId, documentKey }: Props) => {
  const [name, setName] = useState("");

  const getDocumentQuery = trpc.getDocument.useQuery(documentId);
  const updateDocumentMutation = trpc.updateDocument.useMutation();

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
    const { ciphertext, nonce, commitment } = encryptString({
      value: name,
      key: documentKey,
    });
    updateDocumentMutation.mutate({
      id: documentId,
      nameCiphertext: ciphertext,
      nameNonce: nonce,
      nameCommitment: commitment,
    });
  };

  return (
    <View>
      <Input
        // required TODO
        className="border border-slate-300 p-2 rounded"
        placeholder="List name"
        autoComplete="off"
        value={name}
        onChangeText={(value) => {
          setName(value);
          updateName(value);
        }}
      />
    </View>
  );
};
