import { MMKV } from "react-native-mmkv";

const createStorage = () => {
  return new MMKV({
    id: `locker-storage`,
  });
};

let storage = createStorage();

export const rotateLockerStorageKey = async () => {
  throw new Error("Not implemented");
};

export const getLockerStorage = () => storage;
