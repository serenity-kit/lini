import canonicalize from "canonicalize";
import * as sodium from "react-native-libsodium";

export const encryptLocker = (
  content: string,
  clock: number,
  key: Uint8Array
) => {
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  const nonceString = sodium.to_base64(nonce);
  const additionalData = canonicalize({ clock });
  if (!additionalData) {
    throw new Error("Failed to canonicalize additional data");
  }
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    content,
    additionalData,
    null,
    nonce,
    key
  );
  const ciphertextString = sodium.to_base64(ciphertext);

  const commitmentContent = canonicalize({
    nonce: nonceString,
    ciphertext: ciphertextString,
    additionalData,
  });
  if (!commitmentContent) {
    throw new Error("Failed to canonicalize commitment data");
  }

  const commitment = sodium.crypto_auth(commitmentContent, key);

  return {
    nonce: nonceString,
    ciphertext: ciphertextString,
    commitment: sodium.to_base64(commitment),
    clock,
  };
};
