import * as sodium from "react-native-libsodium";
import { decryptString } from "./decryptString";
import { encryptString } from "./encryptString";

beforeAll(async () => {
  await sodium.ready;
});

// test encrypting and decrypting a string
test("encryptString and decryptString", () => {
  const key = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const content = "hello world";
  const { ciphertext, commitment, nonce } = encryptString({
    value: content,
    key,
  });
  const decryptedContent = decryptString({
    ciphertext,
    commitment,
    nonce,
    key,
  });
  expect(decryptedContent).toEqual(content);
});
