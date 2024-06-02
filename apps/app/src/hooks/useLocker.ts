import { useMemo } from "react";
import sodium from "react-native-libsodium";
import { MMKV } from "react-native-mmkv";
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

  const content = useMemo(() => {
    const localLocker = getCompleteLocalLocker();

    if (!latestUserLockerQuery.data || localLocker.lockerKey === undefined) {
      return localLocker;
    }

    const keyUint8Array = sodium.from_base64(localLocker.lockerKey);
    const contentString = decryptLocker(
      latestUserLockerQuery.data,
      keyUint8Array
    );
    return {
      // TODO validate schema
      ...JSON.parse(contentString),
      ...localLocker,
    };
  }, [
    latestUserLockerQuery.data?.ciphertext,
    latestUserLockerQuery.data?.nonce,
    latestUserLockerQuery.data?.commitment,
    latestUserLockerQuery.data?.clock,
  ]);

  // TODO RETRY in case it fails
  const addItem = async (
    params:
      | { type: "document"; documentId: string; value: string }
      | { type: "lockerKey"; value: string }
  ) => {
    const newKey =
      params.type === "document"
        ? `document:${params.documentId}`
        : "lockerKey";

    lockerStorage.set(newKey, params.value);

    const localLocker = getCompleteLocalLocker();
    const newContent = {
      ...localLocker,
      ...content,
      [newKey]: params.value,
    };
    const newContentString = JSON.stringify(newContent);
    const newClock =
      latestUserLockerQuery.data?.clock !== undefined
        ? latestUserLockerQuery.data.clock + 1
        : 0;

    if (!localLocker.lockerKey) {
      throw new Error("Locker key not found");
    }

    const keyUint8Array = sodium.from_base64(localLocker.lockerKey);
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
    addItem,
  };
};
