import { MMKV } from "react-native-mmkv";

const sessionKeyStorage = new MMKV({
  id: `session-key-storage`,
});

export const setSessionKey = (sessionKey: string) => {
  sessionKeyStorage.set("sessionKey", sessionKey);
};

export const getSessionKey = () => {
  return sessionKeyStorage.getString("sessionKey");
};

export const clearSessionKey = async () => {
  sessionKeyStorage.delete("sessionKey");
};
