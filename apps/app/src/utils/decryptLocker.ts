import canonicalize from "canonicalize";
import * as sodium from "react-native-libsodium";

type EncryptedLocker = {
  ciphertext: string;
  nonce: string;
  commitment: string;
  clock: number;
};

export const decryptLocker = (
  encryptedLocker: EncryptedLocker,
  key: Uint8Array
) => {
  const { ciphertext, nonce, commitment, clock } = encryptedLocker;

  const additionalData = canonicalize({ clock });
  if (!additionalData) {
    throw new Error("Failed to canonicalize additional data");
  }
  const commitmentContent = canonicalize({
    nonce,
    ciphertext,
    additionalData,
  });
  if (!commitmentContent) {
    throw new Error("Failed to canonicalize commitment data");
  }

  const isValidCommitment = sodium.crypto_auth_verify(
    sodium.from_base64(commitment),
    commitmentContent,
    key
  );
  if (!isValidCommitment) {
    throw new Error("Invalid commitment");
  }

  const decryptedContent = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.from_base64(ciphertext),
    additionalData,
    sodium.from_base64(nonce),
    key
  );
  if (!decryptedContent) {
    throw new Error("Failed to decrypt locker");
  }

  return sodium.to_string(decryptedContent);
};
