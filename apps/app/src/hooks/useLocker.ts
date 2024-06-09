import { useMemo } from "react";
import sodium from "react-native-libsodium";
import { MMKV } from "react-native-mmkv";
import { getLockerKey } from "../locker/lockerKeyStorage";
import { decryptLocker } from "../utils/decryptLocker";
import { encryptLocker } from "../utils/encryptLocker";
import { trpc } from "../utils/trpc";

export const lockerStorage = new MMKV({
  id: `locker-storage`,
});

const getCompleteLocalLocker = () => {
  const allKeys = lockerStorage.getAllKeys();
  return allKeys.reduce<Record<string, string | undefined>>((acc, key) => {
    acc[key] = lockerStorage.getString(key);
    return acc;
  }, {});
};

export const useLocker = () => {
  const createUserLockerMutation = trpc.createUserLocker.useMutation();
  const latestUserLockerQuery = trpc.getLatestUserLocker.useQuery();

  const mergeLocalAndRemoteLocker = (data: {
    ciphertext: string;
    nonce: string;
    commitment: string;
    clock: number;
  }) => {
    const localLocker = getCompleteLocalLocker();
    const lockerKeyString = getLockerKey();
    if (!lockerKeyString) {
      throw new Error("Locker key not found.");
    }
    const lockerKey = sodium.from_base64(lockerKeyString);
    const contentString = decryptLocker(data, lockerKey);
    return {
      // TODO validate schema
      ...JSON.parse(contentString),
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
    lockerStorage.set(newKey, params.value);

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
