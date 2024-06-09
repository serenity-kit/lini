import { useMemo } from "react";
import sodium from "react-native-libsodium";
import { getLockerKey } from "../locker/lockerKeyStorage";
import { getLockerStorage } from "../locker/lockerStorage";
import { decryptLocker } from "../utils/decryptLocker";
import { encryptLocker } from "../utils/encryptLocker";
import { trpc } from "../utils/trpc";

const getCompleteLocalLocker = () => {
  const lockerStorage = getLockerStorage();
  const allKeys = lockerStorage.getAllKeys();
  return allKeys.reduce<Record<string, string | undefined>>((acc, key) => {
    acc[key] = lockerStorage.getString(key);
    return acc;
  }, {});
};

export const useLocker = () => {
  const createUserLockerMutation = trpc.createUserLocker.useMutation();
  const latestUserLockerQuery = trpc.getLatestUserLocker.useQuery(undefined, {
    refetchInterval: 5000,
  });

  const mergeLocalAndRemoteLocker = (data: {
    ciphertext: string;
    nonce: string;
    commitment: string;
    clock: number;
  }) => {
    const localLocker = getLockerStorage();
    const localLockerValues = getCompleteLocalLocker();

    const lockerKeyString = getLockerKey();
    if (!lockerKeyString) {
      throw new Error("Locker key not found.");
    }
    const lockerKey = sodium.from_base64(lockerKeyString);
    const contentString = decryptLocker(data, lockerKey);
    // TODO validate schema
    const newContent = JSON.parse(contentString);

    // update the local locker with the remote locker values
    Object.keys(newContent).forEach((key) => {
      const value = newContent[key];
      if (!value) {
        return;
      }
      if (!localLockerValues[key]) {
        localLocker.set(key, value);
      }
    });

    return {
      ...newContent,
      ...localLocker,
    };
  };

  const refetchRemoteLocker = async () => {
    const result = await latestUserLockerQuery.refetch();
    if (result.data) {
      return {
        clock: result.data.clock,
        content: mergeLocalAndRemoteLocker(result.data),
      };
    }
    return {
      clock: -1,
      content: getCompleteLocalLocker(),
    };
  };

  const content = useMemo(() => {
    if (!latestUserLockerQuery.data) {
      const localLocker = getCompleteLocalLocker();
      return localLocker;
    }
    return mergeLocalAndRemoteLocker(latestUserLockerQuery.data);
  }, [
    latestUserLockerQuery.data?.ciphertext,
    latestUserLockerQuery.data?.nonce,
    latestUserLockerQuery.data?.commitment,
    latestUserLockerQuery.data?.clock,
  ]);

  // TODO mutation RETRY in case it fails
  const addItem = async (params: {
    type: "document";
    documentId: string;
    value: string;
  }) => {
    const { clock, content } = await refetchRemoteLocker();
    const newKey = `document:${params.documentId}`;
    getLockerStorage().set(newKey, params.value);

    const newContent = {
      ...content,
      [newKey]: params.value,
    };
    const newContentString = JSON.stringify(newContent);
    const newClock = clock + 1;

    const lockerKeyString = getLockerKey();
    if (!lockerKeyString) {
      throw new Error("Locker key not found.");
    }
    const lockerKey = sodium.from_base64(lockerKeyString);
    const { ciphertext, nonce, commitment } = encryptLocker(
      newContentString,
      newClock,
      lockerKey
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
    addItem,
    refetchRemoteLocker,
  };
};
