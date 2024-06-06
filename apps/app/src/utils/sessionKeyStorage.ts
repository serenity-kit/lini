import { MMKV } from "react-native-mmkv";
// TODO replace with secure storage!!!

const sessionKeyStorage = new MMKV({
  id: `session-key-storage`,
});

export const setSessionKey = (sessionKey: string) => {
  sessionKeyStorage.set("sessionKey", sessionKey);
};

export const getSessionKey = () => {
  return sessionKeyStorage.getString("sessionKey");
};
