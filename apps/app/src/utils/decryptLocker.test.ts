import { decryptLocker } from "./decryptLocker";
import { encryptLocker } from "./encryptLocker";

import * as sodium from "react-native-libsodium";

beforeAll(async () => {
  await sodium.ready;
});

// test encrypting and decrypting a locker
test("encryptLocker and decryptLocker", () => {
  const key = new Uint8Array(32);
  const content = "hello world";
  const clock = 1234;
  const encryptedLocker = encryptLocker(content, clock, key);
  const decryptedContent = decryptLocker(encryptedLocker, key);
  expect(decryptedContent).toEqual(content);
});
