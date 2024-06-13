import * as SecureStore from "expo-secure-store";

export const setLockerKey = (lockerKey: string) => {
  SecureStore.setItem("lockerKey", lockerKey);
};

export const getLockerKey = () => {
  return SecureStore.getItem("lockerKey");
};

export const clearLockerKey = async () => {
  return SecureStore.deleteItemAsync("lockerKey");
};
