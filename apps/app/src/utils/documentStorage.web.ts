import { MMKV } from "react-native-mmkv";

const createStorages = () => {
  return {
    documentStorage: new MMKV({
      id: `document-storage`,
    }),
    documentNameStorage: new MMKV({
      id: `document-name-storage`,
    }),
    documentPendingChangesStorage: new MMKV({
      id: `document-pending-changes-storage`,
    }),
  };
};

let storages = createStorages();

export const rotateStorageKey = async () => {
  throw new Error("Not implemented");
};

export const getDocumentStorage = () => storages;
