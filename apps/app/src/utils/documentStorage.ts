import { MMKV } from "react-native-mmkv";

export const documentStorage = new MMKV({
  id: `document-storage`,
});

export const documentNameStorage = new MMKV({
  id: `document-name-storage`,
});

export const documentPendingChangesStorage = new MMKV({
  id: `document-pending-changes-storage`,
});
