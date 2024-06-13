import * as SecureStore from "expo-secure-store";
import * as sodium from "react-native-libsodium";
import { MMKV } from "react-native-mmkv";

const keyIdentifier = "document-storage-key";

const getOrCreateDocumentStorageKey = () => {
  const key = SecureStore.getItem(keyIdentifier);
  if (key) {
    return key;
  }
  const newKey = sodium.to_base64(sodium.randombytes_buf(16));
  SecureStore.setItem(keyIdentifier, newKey);
  return newKey;
};

const createStorages = () => {
  const key = getOrCreateDocumentStorageKey();
  return {
    documentStorage: new MMKV({
      id: `document-storage`,
      encryptionKey: key,
    }),
    documentNameStorage: new MMKV({
      id: `document-name-storage`,
      encryptionKey: key,
    }),
    documentPendingChangesStorage: new MMKV({
      id: `document-pending-changes-storage`,
      encryptionKey: key,
    }),
  };
};

let storages = createStorages();

export const rotateStorageKey = async () => {
  const newKey = sodium.to_base64(sodium.randombytes_buf(16));
  SecureStore.setItem(keyIdentifier, newKey);
  storages = createStorages();
};

export const getDocumentStorage = () => storages;
