import * as SecureStore from "expo-secure-store";

export const setSessionKey = (sessionKey: string) => {
  SecureStore.setItem("sessionKey", sessionKey);
};

export const getSessionKey = () => {
  return SecureStore.getItem("sessionKey");
};

export const clearSessionKey = async () => {
  return SecureStore.deleteItemAsync("sessionKey");
};
