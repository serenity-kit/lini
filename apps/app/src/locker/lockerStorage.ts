import * as SecureStore from "expo-secure-store";
import * as sodium from "react-native-libsodium";
import { MMKV } from "react-native-mmkv";

const keyIdentifier = "locker-storage-encryption-key";

const getOrCreateLockerStorageKey = () => {
  const key = SecureStore.getItem(keyIdentifier);
  if (key) {
    return key;
  }
  const newKey = sodium.to_base64(sodium.randombytes_buf(16));
  SecureStore.setItem(keyIdentifier, newKey);
  return newKey;
};

const createStorage = () => {
  const key = getOrCreateLockerStorageKey();
  return new MMKV({
    id: `locker-storage`,
    encryptionKey: key,
  });
};

let storage = createStorage();

export const rotateLockerStorageKey = async () => {
  const newKey = sodium.to_base64(sodium.randombytes_buf(16));
  SecureStore.setItem(keyIdentifier, newKey);
  storage = createStorage();
};

export const getLockerStorage = () => storage;
