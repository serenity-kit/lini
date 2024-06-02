import { useMemo } from "react";
import sodium from "react-native-libsodium";
import { decryptLocker } from "../utils/decryptLocker";
import { encryptLocker } from "../utils/encryptLocker";
import { trpc } from "../utils/trpc";

export const useLocker = (key: string) => {
  const createUserLockerMutation = trpc.createUserLocker.useMutation();
  const latestUserLockerQuery = trpc.getLatestUserLocker.useQuery();

  const keyUint8Array = sodium.from_base64(key);

  const content = useMemo(() => {
    if (!latestUserLockerQuery.data) {
      return null;
    }

    const contentString = decryptLocker(
      latestUserLockerQuery.data,
      keyUint8Array
    );
    return JSON.parse(contentString) || {}; // TODO validate schema
  }, [
    latestUserLockerQuery.data?.ciphertext,
    latestUserLockerQuery.data?.nonce,
    latestUserLockerQuery.data?.commitment,
    latestUserLockerQuery.data?.clock,
  ]);

  // RETRY in case it fails
  const addDocumentKey = async (documentId: string, value: string) => {
    const newContent = {
      ...content,
      [documentId]: value,
    };
    const newContentString = JSON.stringify(newContent);
    const newClock =
      latestUserLockerQuery.data?.clock !== undefined
        ? latestUserLockerQuery.data.clock + 1
        : 0;

    const { ciphertext, nonce, commitment } = encryptLocker(
      newContentString,
      newClock,
      keyUint8Array
    );

    await createUserLockerMutation.mutateAsync({
      ciphertext,
      nonce,
      commitment,
      clock: newClock,
    });
    await latestUserLockerQuery.refetch();
  };

  return {
    content,
    addDocumentKey,
  };
};
