import { MMKV } from "react-native-mmkv";

const lockerKeyStorage = new MMKV({
  id: `locker-key-storage`,
});

export const setLockerKey = (lockerKey: string) => {
  lockerKeyStorage.set("lockerKey", lockerKey);
};

export const getLockerKey = () => {
  return lockerKeyStorage.getString("lockerKey");
};

export const clearLockerKey = async () => {
  lockerKeyStorage.delete("lockerKey");
};
