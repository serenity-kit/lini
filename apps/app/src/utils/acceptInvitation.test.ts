import * as sodium from "react-native-libsodium";
import { acceptInvitation } from "./acceptInvitation";
import { createInvitation } from "./createInvitation";

beforeAll(async () => {
  await sodium.ready;
});

test("createInvitation and acceptInvitation", () => {
  const listKey = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_IETF_KEYBYTES
  );
  const sessionKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);

  const { ciphertext, nonce, seed } = createInvitation({
    listKey,
    sessionKey,
  });

  const { listKey: decryptedListKey } = acceptInvitation({
    ciphertext,
    nonce,
    seed,
    sessionKey,
  });
  expect(decryptedListKey).toEqual(listKey);
});

test("createInvitation and acceptInvitation with different sessionKeys", () => {
  const listKey = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_IETF_KEYBYTES
  );
  const sessionKey1 = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);

  const { ciphertext, nonce, seed } = createInvitation({
    listKey,
    sessionKey: sessionKey1,
  });

  // decrypt on the server
  const invitation = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sessionKey1
  );

  // encrypt on the server
  const sessionKey2 = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  const session2Nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const session2Ciphertext = sodium.crypto_secretbox_easy(
    invitation,
    session2Nonce,
    sessionKey2
  );

  const { listKey: decryptedListKey } = acceptInvitation({
    ciphertext: sodium.to_base64(session2Ciphertext),
    nonce: sodium.to_base64(session2Nonce),
    seed,
    sessionKey: sessionKey2,
  });
  expect(decryptedListKey).toEqual(listKey);
});
